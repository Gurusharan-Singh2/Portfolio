"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function ChatPage() {
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

  const queryClient = useQueryClient();

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (!stored) router.push("/login");
      else setToken(stored);
    }
  }, [router]);

  // Decode token to get userId
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      setUserId(payload?.id || null);
    } catch {
      router.push("/login");
    }
  }, [token, router]);

  // Fetch messages history
  const { data: messages = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ["messages", ADMIN_USER_ID],
    queryFn: async () => {
      const res = await axios.get(`/api/messages?userId=${ADMIN_USER_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
  });

  // Setup socket
  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { query: { token } });
    }

    // Debug socket connection
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket server:", socketRef.current.id);
    });
    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    const handlePrivateMessage = (msg) => {
      const adminStr = String(ADMIN_USER_ID);
      if ([String(msg.senderId), String(msg.recipientId)].includes(adminStr)) {
        queryClient.setQueryData(["messages", ADMIN_USER_ID], (prev = []) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
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
      socketRef.current?.off("privateMessage", handlePrivateMessage);
      socketRef.current?.off("typing", handleTyping);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token, ADMIN_USER_ID, SOCKET_URL, queryClient]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Send message
  const sendMessage = () => {
    const text = newMsg.trim();
    if (!text || !socketRef.current) return;

    const optimistic = {
      _id: `local-${Date.now()}`,
      senderId: userId,
      recipientId: ADMIN_USER_ID,
      text,
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    queryClient.setQueryData(["messages", ADMIN_USER_ID], (prev = []) => [...prev, optimistic]);

    // Send to server (include senderId!)
    socketRef.current.emit("privateMessage", {
      senderId: userId,
      recipientId: ADMIN_USER_ID,
      text,
    });

    setNewMsg("");
  };

  // Handle typing events
  const handleChange = (e) => {
    setNewMsg(e.target.value);
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 500) {
      socketRef.current?.emit("typing", { recipientId: ADMIN_USER_ID, senderId: userId });
      lastTypingEmitRef.current = now;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-violet-700 to-purple-700 p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-white/10 backdrop-blur-lg rounded-2xl flex overflow-hidden shadow-2xl border border-white/20">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col bg-white/5 p-5 border-r border-white/20">
          <div className="text-white font-semibold mb-4">Support Chat</div>
          <div className="text-xs text-white/70">Gurusharan Singh • Online</div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <h2 className="text-white font-semibold">Chat Support</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {isHistoryLoading && <div className="text-white/80">Loading messages...</div>}

            {messages.map((m) => {
              const isOwn = m.senderId === userId;
              return (
                <div key={m._id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                  {!isOwn && (
                    <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">
                      GS
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm ${
                      isOwn
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        : "bg-white/20 text-white border border-white/10"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {isOwn && (
                    <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">
                      You
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-white/70">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs">GS</div>
                <div className="px-4 py-2 rounded-2xl bg-white/20 flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-400" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/20 bg-white/5 backdrop-blur-md flex items-center gap-3 sticky bottom-0">
            <input
              type="text"
              value={newMsg}
              onChange={handleChange}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-full border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-violet-400"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full hover:from-violet-600 hover:to-purple-700 transition flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
