"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Send } from "lucide-react";

export default function AdminChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  // Load token and ensure admin
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return;
    setToken(stored);
    try {
      const payload = JSON.parse(atob(stored.split(".")[1] || ""));
      if (payload?.isAdmin) setAdminId(payload.id);
    } catch (decodeErr) {
      console.warn("Failed to decode admin token", decodeErr);
    }
  }, []);

  // Load users
  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUsers(res.data);
        if (res.data.length && !activeUser) setActiveUser(res.data[0]);
      });
  }, [token]);

  // Fetch messages for active user
  useEffect(() => {
    if (!token || !activeUser?._id) return;
    axios
      .get(`/api/messages?userId=${activeUser._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessages(res.data));
  }, [token, activeUser]);

  // Socket
  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) socketRef.current = io(SOCKET_URL, { query: { token } });

    const onMsg = (m) => {
      if (m.senderId === activeUser?._id || m.recipientId === activeUser?._id) {
        setMessages((prev) => [...prev, m]);
      }
    };
    const onTyping = ({ senderId }) => {
      if (senderId === activeUser?._id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1200);
      }
    };
    socketRef.current.on("privateMessage", onMsg);
    socketRef.current.on("typing", onTyping);
    return () => {
      if (!socketRef.current) return;
      socketRef.current.off("privateMessage", onMsg);
      socketRef.current.off("typing", onTyping);
    };
  }, [token, SOCKET_URL, activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!newMsg.trim() || !activeUser?._id) return;
    socketRef.current?.emit("privateMessage", { recipientId: activeUser._id, text: newMsg.trim() });
    setMessages((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, senderId: adminId, recipientId: activeUser._id, text: newMsg.trim(), timestamp: new Date().toISOString() },
    ]);
    setNewMsg("");
  };

  return (
    <div className="min-h-[70vh] flex gap-4">
      {/* Users */}
      <aside className="hidden md:flex w-64 flex-col border border-white/20 bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-white">
        <h3 className="font-semibold mb-3">Users</h3>
        <div className="space-y-2 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => setActiveUser(u)}
              className={`w-full text-left px-3 py-2 rounded-lg border border-white/10 ${
                activeUser?._id === u._id ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {u.email}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden flex flex-col">
        <div className="px-4 py-4 border-b border-white/20 bg-white/5 text-white">
          {activeUser ? `Chat with ${activeUser.email}` : "Select a user"}
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((m) => {
            const isOwn = m.senderId === adminId;
            return (
              <div key={m._id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                {!isOwn && <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs border border-white/10">U</div>}
                <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow ${isOwn ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-none" : "bg-white/20 backdrop-blur-md text-white rounded-bl-none border border-white/10"}`}>
                  <div>{m.text}</div>
                  <div className={`mt-1 text-[10px] opacity-80 ${isOwn ? "text-white" : "text-violet-100"}`}>
                    {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {isOwn && <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs shadow">You</div>}
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-violet-100 px-2">
              <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs border border-white/10">U</div>
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
        <div className="border-t border-white/20 bg-white/5 backdrop-blur-md p-3 sm:p-4 flex items-center gap-3">
          <input
            className="flex-1 p-3 text-sm rounded-full border border-white/20 bg-white/10 text-white placeholder-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            value={newMsg}
            onChange={(e) => {
              setNewMsg(e.target.value);
              if (activeUser?._id) socketRef.current?.emit("typing", { recipientId: activeUser._id });
            }}
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
      </div>
    </div>
  );
}


