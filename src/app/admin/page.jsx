"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { redirect } from "next/navigation";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";

export default function AdminDashboard() {
  const [token, setToken] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeRecipientIdRef = useRef(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
  const FIXED_RECIPIENT_ID = process.env.NEXT_PUBLIC_ADMIN_ID;

  // -------------------- Token & Admin Validation --------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      redirect("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(savedToken.split(".")[1] || ""));
      if (!payload?.isAdmin) {
        redirect("/"); // non-admin can't access
        return;
      }
      setToken(savedToken);
      setAdminId(payload.id);
    } catch {
      redirect("/login");
    }
  }, []);

  // -------------------- Fetch Users --------------------
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // cache for 5 mins
  });

  // -------------------- Select Default User --------------------
  useEffect(() => {
    if (!users.length || selectedUser) return;
    const fixedUser = users.find((u) => u._id === FIXED_RECIPIENT_ID);
    setSelectedUser(fixedUser || users[0]);
  }, [users, selectedUser]);

  // -------------------- Initialize Socket --------------------
  useEffect(() => {
    if (!token || socketRef.current) return;

    socketRef.current = io(SOCKET_URL, { query: { token } });

    const handlePrivateMessage = (m) => {
      const activeId = activeRecipientIdRef.current;
      if (!activeId) return;
      if (m.senderId === activeId || m.recipientId === activeId) {
        setMessages((prev) => [...prev, m]);
      }
    };

    socketRef.current.on("privateMessage", handlePrivateMessage);
    socketRef.current.on("typing", ({ senderId }) => {
      const activeId = activeRecipientIdRef.current;
      if (!activeId || senderId !== activeId) return;
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1200);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // -------------------- Fetch Messages --------------------
  useEffect(() => {
    const activeRecipientId = selectedUser?._id || FIXED_RECIPIENT_ID;
    activeRecipientIdRef.current = activeRecipientId;
    if (!activeRecipientId || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/messages?userId=${activeRecipientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedUser, token]);

  // -------------------- Scroll to Bottom --------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // -------------------- Send Message --------------------
  const sendMessage = () => {
    if (!msg.trim()) return;
    const recipientId = selectedUser?._id || FIXED_RECIPIENT_ID;

    socketRef.current.emit("privateMessage", { recipientId, text: msg });

    const optimisticMsg = {
      _id: `local-${Date.now()}`,
      senderId: adminId,
      recipientId,
      text: msg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMsg("");
  };

  return (
    <div className="w-full min-h-screen bg-violet-600 p-4 flex flex-col">
      {/* Header */}
      <div className="text-white text-3xl font-bold mb-4">Admin Dashboard</div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* -------------------- Users List -------------------- */}
        <div className="w-full md:w-64 bg-violet-700 text-white rounded-lg overflow-y-auto shadow-lg">
          <h3 className="text-lg font-semibold p-4 border-b border-violet-500">Users</h3>
          {users.map((u) => (
            <button
              key={u._id}
              className={`flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-violet-800 transition 
                         ${selectedUser?._id === u._id ? "bg-violet-900 font-semibold" : ""}`}
              onClick={() => setSelectedUser(u)}
            >
              <FaUserCircle className="text-xl text-white" />
              <span className="truncate">{u.email}</span>
            </button>
          ))}
        </div>

        {/* -------------------- Chat Area -------------------- */}
        <div className="flex-1 flex flex-col bg-violet-100 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-violet-700 text-white font-semibold flex items-center justify-between rounded-t-lg">
            Chat with {selectedUser?.email || "User"}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isAdminMsg = m.senderId === adminId;
              return (
                <div key={m._id} className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] break-words px-4 py-2 rounded-lg shadow 
                                ${isAdminMsg ? "bg-violet-700 text-white" : "bg-violet-200 text-violet-900"}`}
                  >
                    <span className="text-xs opacity-70 block mb-1">{isAdminMsg ? "You" : selectedUser?.email}</span>
                    <span>{m.text}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {isTyping && <div className="px-4 py-1 text-sm text-violet-800">{selectedUser?.email} is typing…</div>}

          {/* Input Area */}
          {selectedUser && (
            <div className="flex items-center p-4 gap-2 border-t border-violet-300">
              <input
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value);
                  socketRef.current?.emit("typing", { recipientId: selectedUser._id });
                }}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={sendMessage}
                className="bg-violet-700 hover:bg-violet-800 text-white p-2 rounded-lg flex items-center justify-center"
              >
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
