import sendEmail from "@/utils/Email.js";

export async function POST(req) {
  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), {
      status: 400,
    });
  }

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4B0082;">New Contact Form Submission</h2>
      <p style="font-size: 16px; color: #333;"><strong>Name:</strong> ${name}</p>
      <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${email}</p>
      <p style="font-size: 16px; color: #333;"><strong>Message:</strong></p>
      <div style="font-size: 15px; color: #555; white-space: pre-line; line-height: 1.6;">
        ${message}
      </div>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;" />
      <p style="font-size: 13px; color: #888;">This message was sent from your website contact form.</p>
    </div>
  `;

  const success = await sendEmail({
    email: process.env.NEXT_PUBLIC_SMTP_MAIL || 'your@email.com',
    subject: `New Contact Form Submission from ${name}`,
    message: htmlMessage,
  });

  if (success) {
    return new Response(JSON.stringify({ message: 'Message sent successfully' }), {
      status: 200,
    });
  } else {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
    });
  }
}
