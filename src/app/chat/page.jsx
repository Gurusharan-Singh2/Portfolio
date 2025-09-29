"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const router = useRouter();
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  const messagesEndRef = useRef(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
  const activeRecipientIdRef = useRef(ADMIN_USER_ID);

  // Load token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (!stored) {
        router.push("/login");
      } else {
        setToken(stored);
      }
    }
  }, [router]);

  // Decode userId
  useEffect(() => {
    if (!token){
      redirect('/login')
    };
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      setUserId(payload?.id || null);
    } catch (err) {
      router.push("/login");
    }
  }, [token, router]);

  // Fetch history
  const { data: initialMessages } = useQuery({
    queryKey: ["messages", ADMIN_USER_ID],
    queryFn: async () => {
      const res = await axios.get(`/api/messages?userId=${ADMIN_USER_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: Boolean(token),
  });

  // Init socket
  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { query: { token } });
    }

    const handlePrivateMessage = (msg) => {
      if (
        msg.senderId === activeRecipientIdRef.current ||
        msg.recipientId === activeRecipientIdRef.current
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (payload) => {
      if (payload?.senderId === ADMIN_USER_ID) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1200);
      }
    };

    socketRef.current.on("privateMessage", handlePrivateMessage);
    socketRef.current.on("typing", handleTyping);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("privateMessage", handlePrivateMessage);
        socketRef.current.off("typing", handleTyping);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // Load initial history
  useEffect(() => {
    if (Array.isArray(initialMessages)) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send msg
  const sendMessage = () => {
    if (!newMsg.trim()) return;
    socketRef.current?.emit("privateMessage", {
      recipientId: ADMIN_USER_ID,
      text: newMsg.trim(),
    });

    // optimistic
    const optimistic = {
      _id: `local-${Date.now()}`,
      senderId: userId,
      recipientId: ADMIN_USER_ID,
      text: newMsg.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMsg("");
  };

  const handleChange = (e) => {
    setNewMsg(e.target.value);
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 500) {
      socketRef.current?.emit("typing", { recipientId: ADMIN_USER_ID });
      lastTypingEmitRef.current = now;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white dark:bg-zinc-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold">
            GS
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              Gurusharan Singh
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Online</p>
          </div>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Support Chat • Feel free to ask any questions
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Chat Support
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/40">
          {messages.map((m) => {
            const isOwn = userId && m.senderId === userId;
            return (
              <div key={m._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow ${
                    isOwn
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 px-2">
              Gurusharan Singh is typing…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 flex items-center gap-3 shrink-0">
          <input
            className="flex-1 p-3 text-sm rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
            value={newMsg}
            onChange={handleChange}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}
