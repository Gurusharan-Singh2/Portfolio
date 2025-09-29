"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import PageContainer from "@/components/ui/PageContainer";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupMutation = useMutation({
    mutationFn: (data) => axios.post("/api/auth/signup", data),
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      window.location.href = "/chat";
    },
    onError: (err) => {
      alert(err.response?.data?.error || "Signup failed");
    },
  });

  const handleSignup = () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }
    signupMutation.mutate({ email, password });
  };

  return (
    <PageContainer title="Signup" maxWidth="sm">
      <div className="flex flex-col gap-4 mt-8">
        <h1 className="text-2xl font-semibold text-center text-zinc-800 dark:text-zinc-100">
          Create an account
        </h1>

        <input
          className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={`w-full p-3 rounded-lg text-white font-medium transition 
                      ${signupMutation.isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={handleSignup}
          disabled={signupMutation.isLoading}
        >
          {signupMutation.isLoading ? "Signing up..." : "Signup"}
        </button>
      </div>
    </PageContainer>
  );
}
