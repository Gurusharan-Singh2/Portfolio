"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      setToken(url.searchParams.get("token") || "");
    }
  }, []);

  const submit = async () => {
    if (!password) return alert("Please enter a new password");
    try {
      setLoading(true);
      await axios.post("/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (e) {
      alert(e.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 w-full">
      <div className="w-full max-w-[380px] bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 flex flex-col gap-6 mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">Reset Password</h1>
        {done ? (
          <p className="text-center text-white">Password updated. You can close this tab.</p>
        ) : (
          <>
            <input
              className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}


