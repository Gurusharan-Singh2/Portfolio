"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
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
    if (!token) return; // wait for token load
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
  }, [token, ADMIN_USER_ID, SOCKET_URL]);

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
    <div className="min-h-screen w-full flex items-center justify-center  ">
      <div className="w-full max-w-5xl h-[80vh] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 dark:bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20  flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/20 bg-white/5 dark:bg-white/5 p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold shadow">
            GS
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Gurusharan Singh
            </p>
            <p className="text-xs text-violet-200">Online</p>
          </div>
        </div>
        <div className="text-xs text-violet-100/80">
          Support Chat • Feel free to ask any questions
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/20 bg-white/5 backdrop-blur-md shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Chat Support
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 bg-transparent">
          {messages.map((m) => {
            const isOwn = userId && m.senderId === userId;
            return (
              <div
                key={m._id}
                className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs border border-white/10">GS</div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow ${
                    isOwn
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-none"
                      : "bg-white/20 backdrop-blur-md text-white rounded-bl-none border border-white/10"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className={`mt-1 text-[10px] opacity-80 ${isOwn ? "text-white" : "text-violet-100"}`}>
                    {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {isOwn && (
                  <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs shadow">You</div>
                )}
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-violet-100 px-2">
              <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs border border-white/10">GS</div>
              <div className="px-4 py-2 rounded-2xl bg-white/20 border border-white/10">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{animationDelay:"0ms"}}></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{animationDelay:"100ms"}}></span>
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{animationDelay:"200ms"}}></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/20 bg-white/5 backdrop-blur-md p-3 sm:p-4 flex items-center gap-3 shrink-0">
          <input
            className="flex-1 p-3 text-sm rounded-full border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            value={newMsg}
            onChange={handleChange}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full hover:from-violet-600 hover:to-purple-700 transition flex items-center justify-center shadow"
          >
            <Send size={18} />
          </button>
        </div>
      </main>
    </div>
    </div>
  );
}
