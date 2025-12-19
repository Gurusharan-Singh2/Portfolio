// /app/api/generate-quiz/route.js
import { NextResponse } from "next/server";

/**
 * Extracts JSON array from text that may contain additional content
 */
function extractJSON(text) {
  if (!text) return null;

  // Strategy 1: Try to find JSON array in the text
  const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      console.error("Failed to parse matched array:", e);
    }
  }

  // Strategy 2: Try to find JSON between code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse code block:", e);
    }
  }

  // Strategy 3: Try to parse the entire text as-is
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse entire text:", e);
  }

  // Strategy 4: Handle truncated JSON - try to repair it
  try {
    let repairedText = text.trim();
    
    // If it starts with [ but doesn't end with ], try to close it
    if (repairedText.startsWith('[')) {
      // Remove any incomplete object at the end
      const lastCompleteObject = repairedText.lastIndexOf('}');
      if (lastCompleteObject !== -1) {
        repairedText = repairedText.substring(0, lastCompleteObject + 1);
        
        // Ensure it ends with ]
        if (!repairedText.endsWith(']')) {
          repairedText += ']';
        }
        
        const parsed = JSON.parse(repairedText);
        console.log("Successfully repaired truncated JSON, recovered", parsed.length, "questions");
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to repair truncated JSON:", e);
  }

  return null;
}

export async function POST(req) {
  try {
    const { topic, limit = 5, difficulty = "medium", excludeQuestions = [] } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Enforce question limit
    if (limit > 20) {
      return NextResponse.json({ error: "Maximum 20 questions allowed" }, { status: 400 });
    }

    if (limit < 1) {
      return NextResponse.json({ error: "Minimum 1 question required" }, { status: 400 });
    }

    const excludeText = excludeQuestions.length 
      ? `\nDo NOT repeat these questions: ${excludeQuestions.join("; ")}` 
      : "";

    const prompt = `Generate ${limit} MCQ questions about "${topic}" (${difficulty} level).${excludeText}

Return ONLY valid JSON array. Format:
[{"question":"Q text","options":["A","B","C","D"],"answer":"A","solution":"Why A"}]

Be concise. Start response with [ and end with ]. No markdown, no explanations.`;

    // Use Groq API (ultra-fast and reliable) with retry logic
    let lastError = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`Retrying after ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const res = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: "You are a quiz generator. Always respond with valid JSON arrays only, no additional text or markdown."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.5,
              max_tokens: 4096,
            }),
          }
        );

        if (res.status === 503 || res.status === 429) {
          // API overloaded or rate limited, retry
          const errorData = await res.json();
          lastError = errorData;
          console.error(`API error ${res.status} (attempt ${attempt + 1}):`, errorData);
          continue; // Try again
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Groq API Error:", errorText);
          return NextResponse.json({ 
            error: `API request failed: ${res.status} ${res.statusText}` 
          }, { status: res.status });
        }

        const data = await res.json();

        // Extract the generated text from Groq response
        let outputText = "";
        if (data.choices && data.choices.length > 0) {
          outputText = data.choices[0].message?.content || "";
        }

        if (!outputText) {
          console.error("Unexpected API response format:", data);
          return NextResponse.json({ 
            error: "Unexpected response from AI model" 
          }, { status: 500 });
        }

        // Try to extract and parse JSON from the output
        const quizJSON = extractJSON(outputText);

        if (!quizJSON || !Array.isArray(quizJSON) || quizJSON.length === 0) {
          console.error("Failed to extract quiz JSON. Raw output:", outputText);
          return NextResponse.json({ 
            error: "Failed to parse AI output. Please try again or reduce the number of questions.",
            debug: outputText.substring(0, 500)
          }, { status: 500 });
        }

        // Validate the quiz structure - accept partial results
        const validQuiz = quizJSON.filter(q => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          q.answer &&
          q.solution
        );

        if (validQuiz.length === 0) {
          return NextResponse.json({ 
            error: "Generated quiz has invalid format. Please try again.",
            debug: JSON.stringify(quizJSON).substring(0, 500)
          }, { status: 500 });
        }

        // Return whatever valid questions we got (even if less than requested)
        console.log(`Returning ${validQuiz.length} valid questions out of ${quizJSON.length} total`);
        return NextResponse.json({ quiz: validQuiz });

      } catch (err) {
        console.error(`Error on attempt ${attempt + 1}:`, err);
        lastError = err;
        if (attempt === maxRetries - 1) break; // Don't retry on last attempt
      }
    }

    // All retries failed
    console.error("All retry attempts failed:", lastError);
    return NextResponse.json({ 
      error: "Service temporarily unavailable. The AI model is overloaded. Please try again in a moment.",
      technical: lastError?.error?.message || "Unknown error"
    }, { status: 503 });

  } catch (err) {
    console.error("Error in generate-quiz:", err);
    return NextResponse.json({ 
      error: err.message || "Internal server error" 
    }, { status: 500 });
  }
}
