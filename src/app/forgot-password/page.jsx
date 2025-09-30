"use client";
import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return alert("Please enter your email");
    try {
      setLoading(true);
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 w-full">
      <div className="w-full max-w-[380px] bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 flex flex-col gap-6 mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">Forgot Password</h1>
        <p className="text-center text-violet-200 text-sm sm:text-base">Enter your email to receive a reset link</p>

        {sent ? (
          <p className="text-center text-white">If this email exists, a reset link has been sent.</p>
        ) : (
          <>
            <input
              className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className={`w-full py-3 rounded-xl font-semibold text-base sm:text-lg text-white shadow-lg transform transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 active:scale-95"
              }`}
              onClick={submit}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}


