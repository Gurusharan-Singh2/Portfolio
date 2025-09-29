"use client";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import PageContainer from "@/components/ui/PageContainer";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

;


  const loginMutation = useMutation({
    mutationFn: (data) => axios.post("/api/auth/login", data),
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      const payload = JSON.parse(atob(res.data.token.split(".")[1] || ""));
      console.log(payload);
      if (payload?.isAdmin) {
        router.push("/admin");
      }else{
        router.push("/chat");
      }
      
      // router.push("/chat")
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
    <PageContainer title="Login" maxWidth="sm">
      <div className="flex flex-col gap-4 mt-8">
        <h1 className="text-2xl font-semibold text-center text-zinc-800 dark:text-zinc-100">
          Login to your account
        </h1>

        <input
          className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={`w-full p-3 rounded-lg text-white font-medium transition 
                      ${loginMutation.isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
          onClick={handleLogin}
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </PageContainer>
  );
}
