"use client";

import { useState, useEffect } from "react";
import { FaCrown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SubscriptionModal from "@/components/SubscriptionModal";

const SUBJECTS = {
  aptitude: {
    name: "Aptitude",
    chapters: [
      "Profit and Loss",
      "Time and Work",
      "Time Speed Distance",
      "Percentage",
      "Ratio and Proportion",
      "Simple Interest",
      "Compound Interest",
      "Ages",
      "Averages",
      "Number Series"
    ]
  },
  reasoning: {
    name: "Reasoning",
    chapters: [
      "Logical Reasoning",
      "Analytical Reasoning",
      "Verbal Reasoning",
      "Blood Relations",
      "Coding-Decoding",
      "Seating Arrangement",
      "Puzzles",
      "Direction Sense",
      "Syllogism",
      "Data Sufficiency"
    ]
  },
  programming: {
    name: "Programming",
    chapters: [
      "Java",
      "Python",
      "JavaScript",
      "React",
      "Node.js",
      "C++",
      "SQL",
      "Data Structures",
      "Algorithms",
      "OOP Concepts",
      "Database Management",
      "System Design"
    ]
  }
};

export default function Page() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [limit, setLimit] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null); // Stores user profile & limits
  const [enableTimer, setEnableTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0];
      if (!token) return;

      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.user) {
        setUserData(data.user);
      }
    } catch (err) {
      console.error("Failed to load user data");
    }
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setChapter("");
  };

  const generateQuiz = async () => {
    const topic = chapter || customTopic;
    if (!topic.trim()) {
      setError("Please select a chapter or enter a custom topic");
      return;
    }

    if (limit > 20) {
      setError("Maximum 20 questions allowed");
      return;
    }

    if (limit < 1) {
      setError("Minimum 1 question required");
      return;
    }

    setLoading(true);
    setError("");
    setQuiz([]);
    setScore(null);

    try {
      // Get token from localStorage or cookie
      const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0];
      
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic, limit, difficulty }),
      });
      
      const data = await res.json();
      
      // Check for 401 Unauthorized (user not logged in)
      if (res.status === 401) {
        showToast("Login is Required");
        setError("");
        setLoading(false);
        return;
      }
      
        if (data.quiz && data.quiz.length > 0) {
        setQuiz(data.quiz);
        setError("");
        fetchUserData(); // effective update of counts
        
        // Start timer if enabled
        if (enableTimer) {
          const totalSeconds = timerMinutes * 60;
          setTimeLeft(totalSeconds);
          startTimer(totalSeconds);
        }
      } else {
        if (res.status === 403 && data.code === "LIMIT_REACHED") {
          setShowSubscriptionModal(true);
          setError(data.error);
        } else {
          const errorMsg = data.error || "Failed to generate quiz";
          setError(errorMsg);
        }
        console.error("Quiz generation error:", data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // eslint-disable-next-line no-unused-vars
  const startTimer = (seconds) => {
    // Clear any existing interval
    if (timerInterval) clearInterval(timerInterval);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          // Auto-submit when time runs out
          if (score === null) {
            submitQuiz();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const submitQuiz = () => {
    // Stop timer
    stopTimer();
    
    let s = 0;
    quiz.forEach((q, i) => {
      const sel = document.querySelector(`input[name="q${i}"]:checked`);
      const val = sel?.value;
      if (val === q.answer) s++;
      document.querySelectorAll(`input[name="q${i}"]`).forEach(input => {
        const lbl = input.parentElement;
        if (input.value === q.answer) {
          lbl.classList.add("!bg-green-100", "dark:!bg-green-900/30", "!border-green-500");
        }
        if (val && input.value === val && val !== q.answer) {
          lbl.classList.add("!bg-red-100", "dark:!bg-red-900/30", "!border-red-500");
        }
        input.disabled = true;
      });
      const solDiv = document.querySelectorAll(".solution")[i];
      if (solDiv) solDiv.classList.remove("hidden");
    });
    setScore(s);
  };

  const resetQuiz = () => {
    stopTimer();
    setQuiz([]);
    setScore(null);
    setError("");
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    // Show only seconds when under 60 seconds
    if (seconds < 60) {
      return `${seconds}`;
    }
    // Show minutes:seconds format when 60+ seconds
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-5 sm:p-6 mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            🎯 AI Quiz Generator
          </h1>
          <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Test your knowledge with AI-generated quizzes
          </p>
          
          {/* User Status Badge */}
          {userData && (
            <div className="flex justify-center mt-4">
                {userData.isSubscribed ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 rounded-full text-yellow-500 text-sm font-bold">
                            <FaCrown /> PREMIUM MEMBER
                        </div>
                        {userData.subscriptionEndDate && (
                            <div className="flex gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                                <span>Started: <strong>{new Date(userData.subscriptionStartDate).toLocaleDateString()}</strong></span>
                                <span>•</span>
                                <span>Expires: <strong>{new Date(userData.subscriptionEndDate).toLocaleDateString()}</strong></span>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                    {Math.max(0, Math.ceil((new Date(userData.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))} Days Left
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 text-sm font-medium">
                            Free Quizzes: <span className={userData.dailyQuizCount >= 3 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                                {Math.max(0, 3 - (userData.dailyQuizCount || 0))}
                            </span> / 3 Left
                        </div>
                        <button 
                            onClick={() => setShowSubscriptionModal(true)}
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                            Upgrade to Unlimited ⚡
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Quiz Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 mb-5">
          {/* Subject & Chapter Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                📚 Subject
              </label>
              <select 
                value={subject}
                onChange={handleSubjectChange}
                disabled={loading}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Select Subject</option>
                {Object.keys(SUBJECTS).map(key => (
                  <option key={key} value={key}>{SUBJECTS[key].name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                📖 Chapter
              </label>
              <select 
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                disabled={loading || !subject}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="">Select Chapter</option>
                {subject && SUBJECTS[subject].chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Topic */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              ✏️ Or Enter Custom Topic
            </label>
            <input 
              type="text"
              placeholder="e.g., Machine Learning, History..." 
              value={customTopic} 
              onChange={e => setCustomTopic(e.target.value)}
              disabled={loading || chapter}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
          
          {/* Questions & Difficulty & Timer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                🔢 Questions
              </label>
              <input 
                type="number" 
                min={1} 
                max={20} 
                value={limit} 
                onChange={e => setLimit(Number(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 text-center text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📊 Difficulty
              </label>
              <select 
                value={difficulty} 
                onChange={e => setDifficulty(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ⏱️ Timer (minutes)
              </label>
              <input 
                type="number" 
                min={1} 
                max={60} 
                value={timerMinutes} 
                onChange={e => setTimerMinutes(Number(e.target.value))}
                disabled={loading || !enableTimer}
                className="w-full px-4 py-3 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                checked={enableTimer}
                onChange={e => setEnableTimer(e.target.checked)}
                disabled={loading}
                className="w-5 h-5 text-violet-600 rounded focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⏱️ Enable Timer (Auto-submit when time runs out)
              </span>
            </label>
          </div>

          {/* Generate Button */}
          <button 
            onClick={generateQuiz}
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl font-semibold text-sm sm:text-base bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Quiz...
              </span>
            ) : (
              "✨ Generate Quiz"
            )}
          </button>
        </div>

        {/* Quiz Questions */}
        {quiz.length > 0 && (
          <div className="space-y-6">
            {/* Timer Display */}
            {timeLeft !== null && score === null && (
              <div className="sticky top-4 z-10 mb-5">
                <div className={`p-3 rounded-xl border-2 text-center shadow-xl transition-all backdrop-blur-sm ${
                  timeLeft > 60 
                    ? 'bg-green-100/95 dark:bg-green-900/60 border-green-500 dark:border-green-600' 
                    : timeLeft > 30 
                      ? 'bg-yellow-100/95 dark:bg-yellow-900/60 border-yellow-500 dark:border-yellow-600' 
                      : 'bg-red-100/95 dark:bg-red-900/60 border-red-500 dark:border-red-600 animate-pulse'
                }`}>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">⏱️</span>
                    <div className="flex flex-col items-center">
                      <span className={`text-4xl sm:text-5xl font-black tabular-nums ${
                        timeLeft > 60 
                          ? 'text-green-700 dark:text-green-300' 
                          : timeLeft > 30 
                            ? 'text-yellow-700 dark:text-yellow-300' 
                            : 'text-red-700 dark:text-red-300'
                      }`}>
                        {formatTime(timeLeft)}
                      </span>
                      {timeLeft < 60 && (
                        <span className={`text-sm font-semibold ${
                          timeLeft > 30 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          seconds
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm sm:text-base font-semibold mt-2 ${
                    timeLeft > 60 
                      ? 'text-green-600 dark:text-green-400' 
                      : timeLeft > 30 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {timeLeft <= 30 ? '⚠️ Hurry up! Time is running out!' : '⏳ Time Remaining'}
                  </p>
                </div>
              </div>
            )}

            {/* Questions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white dark:bg-zinc-800 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                📝 Questions ({quiz.length})
              </h2>
              <button 
                onClick={resetQuiz}
                className="px-3 py-1.5 rounded-lg bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium text-xs transition-colors"
              >
                🔄 New Quiz
              </button>
            </div>

            {/* Question Cards */}
            {quiz.map((q, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-md overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="font-semibold text-sm sm:text-base mb-3 text-gray-900 dark:text-white">
                    <span className="text-violet-600 dark:text-violet-400">Q{i + 1}.</span> {q.question}
                  </div>
                  
                  <div className="space-y-1.5">
                    {q.options.map((opt, j) => (
                      <label key={j} className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-all">
                        <input 
                          type="radio" 
                          name={`q${i}`} 
                          value={String.fromCharCode(65 + j)}
                          className="mt-0.5 w-4 h-4 text-violet-600 focus:ring-violet-500 dark:focus:ring-violet-400"
                        />
                        <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                          <strong className="text-violet-600 dark:text-violet-400">{String.fromCharCode(65 + j)}.</strong> {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Solution Box */}
                  <div className="solution hidden mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">💡</span>
                      <div>
                        <strong className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Solution:</strong>
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mt-0.5">{q.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            {score === null && (
              <button 
                onClick={submitQuiz} 
                className="w-full py-3 px-5 rounded-xl font-semibold text-sm sm:text-base bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
              >
                ✅ Submit Quiz
              </button>
            )}
          </div>
        )}
        
        {/* Score Display */}
        {score !== null && (
          <div className={`mt-5 p-5 sm:p-6 rounded-xl text-center shadow-xl ${
            score / quiz.length >= 0.7 
              ? 'bg-green-600 dark:bg-green-500' 
              : score / quiz.length >= 0.4 
                ? 'bg-yellow-500 dark:bg-yellow-600' 
                : 'bg-red-600 dark:bg-red-500'
          }`}>
            <div className="text-5xl sm:text-6xl mb-3">
              {score / quiz.length >= 0.7 ? '🎉' : score / quiz.length >= 0.4 ? '👍' : '📚'}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Score: {score}/{quiz.length}
            </div>
            <div className="text-lg sm:text-xl text-white/90">
              {Math.round((score / quiz.length) * 100)}% 
              {score / quiz.length >= 0.7 ? ' - Excellent!' : score / quiz.length >= 0.4 ? ' - Good Try!' : ' - Keep Learning!'}
            </div>
          </div>
        )}
      </div>

      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
            setShowSubscriptionModal(false);
            setError("");
            alert("Subscription successful! You can now generate unlimited quizzes.");
        }}
      />

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map((toast, i) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 px-6 py-3 rounded-full shadow-2xl bg-red-600 text-white font-semibold flex items-center gap-2 max-w-md z-50"
            style={{ top: 80 + i * 60 }}
          >
            <span className="text-lg">⚠️</span>
            <span className="truncate">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
