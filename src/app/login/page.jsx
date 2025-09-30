"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data) => axios.post("/api/auth/login", data),
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      const payload = JSON.parse(atob(res.data.token.split(".")[1] || ""));
      if (payload?.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/chat");
      }
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Login failed. Please try again.");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 w-screen">
     <div className="w-full max-w-[380px] bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 flex flex-col gap-6 mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">
          Welcome Back 👋
        </h1>
        <p className="text-center text-violet-200 text-sm sm:text-base">
          Login to continue chatting
        </p>

        {/* Email */}
        <input
          className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          className="w-full p-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {/* Login Button */}
        <button
          className={`w-full py-3 rounded-xl font-semibold text-base sm:text-lg text-white shadow-lg transform transition-all duration-300
            ${
              loginMutation.isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 active:scale-95"
            }`}
          onClick={handleLogin}
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Links */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 sm:gap-0 mt-4 text-sm">
          <button
            onClick={() => router.push("/forgot-password")}
            className="text-violet-200 hover:text-white transition-colors"
          >
            Forgot Password?
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="text-violet-200 hover:text-white transition-colors"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
