"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
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
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

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

  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUsers(res.data);
        if (res.data.length && !activeUser) setActiveUser(res.data[0]);
      });
  }, [token, activeUser]);

  useEffect(() => {
    if (!token || !activeUser?._id) return;
    setIsHistoryLoading(true);
    axios
      .get(`/api/messages?userId=${activeUser._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMessages(res.data))
      .finally(() => setIsHistoryLoading(false));
  }, [token, activeUser]);

  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) socketRef.current = io(SOCKET_URL, { query: { token } });

    const onMsg = (m) => {
      const senderIdStr = m?.senderId ? String(m.senderId) : null;
      const recipientIdStr = m?.recipientId ? String(m.recipientId) : null;
      const activeIdStr = activeUser?._id ? String(activeUser._id) : null;

      if (senderIdStr === activeIdStr || recipientIdStr === activeIdStr) {
        setMessages((prev) => {
          // Attempt to find a matching optimistic message and replace it to avoid duplicates
          const matchIndex = prev.findIndex((existing) => {
            const eSender = existing?.senderId ? String(existing.senderId) : null;
            const eRecipient = existing?.recipientId ? String(existing.recipientId) : null;
            const sameParticipants = eSender === senderIdStr && eRecipient === recipientIdStr;
            const sameText = existing.text === m.text;
            const existingTime = new Date(existing.timestamp || Date.now()).getTime();
            const incomingTime = new Date(m.timestamp || Date.now()).getTime();
            const closeInTimeWindow = Math.abs(existingTime - incomingTime) < 5000;
            return sameParticipants && sameText && closeInTimeWindow;
          });

          if (matchIndex !== -1) {
            const copy = [...prev];
            copy[matchIndex] = { ...copy[matchIndex], ...m };
            return copy;
          }

          return [...prev, m];
        });
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
      socketRef.current.disconnect();
      socketRef.current = null;
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

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  };

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    try {
      const ids = Array.from(selectedIds);
      await axios.delete("/api/messages", {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids },
      });
      setMessages((prev) => prev.filter((m) => !selectedIds.has(String(m._id))));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete messages");
    }
  };

  

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4 bg-gradient-to-b from-violet-200 via-purple-200 to-indigo-200">
      {/* Users */}
      <aside className="hidden md:flex w-64 flex-col bg-violet-50 rounded-2xl shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-100">
        <div className="p-4 border-b border-purple-200 font-semibold text-purple-700 text-lg">
          Users
        </div>
        <div className="flex flex-col divide-y divide-purple-200">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => setActiveUser(u)}
              className={`flex items-center gap-3 p-3 text-left hover:bg-purple-100 transition rounded-lg ${
                activeUser?._id === u._id ? "bg-purple-200 font-semibold" : ""
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-purple-400 text-white flex items-center justify-center text-xs">
                {u.email[0].toUpperCase()}
              </div>
              <span className="truncate">{u.email}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-violet-300 to-purple-300 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-purple-300 font-semibold text-purple-800 flex items-center justify-between">
          <span>{activeUser ? `Chat with ${activeUser.email}` : "Select a user"}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectMode((s) => !s);
                setSelectedIds(new Set());
              }}
              className="px-3 py-1 rounded-md text-sm bg-purple-200 hover:bg-purple-300"
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
            {selectMode && (
              <button
                onClick={deleteSelected}
                disabled={!selectedIds.size}
                className={`px-3 py-1 rounded-md text-sm text-white ${selectedIds.size ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}
              >
                Delete ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 hide-scrollbar">
          {isHistoryLoading && (
            <div className="w-full flex justify-center py-6">
              <div className="flex items-center gap-2 text-purple-700">
                <span className="h-5 w-5 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin"></span>
                <span>Loading messages...</span>
              </div>
            </div>
          )}

          {messages.map((m) => {
            const isOwn = String(m.senderId) === String(adminId);
            return (
              <div key={m._id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                {selectMode && (
                  <input
                    type="checkbox"
                    className="mt-auto mb-1"
                    checked={selectedIds.has(String(m._id))}
                    onChange={() => toggleSelect(String(m._id))}
                  />
                )}
                {!isOwn && (
                  <div className="h-8 w-8 rounded-full bg-purple-300 text-purple-700 flex items-center justify-center text-xs">
                    U
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm shadow ${
                    isOwn
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-none"
                      : "bg-purple-100 text-purple-900 rounded-bl-none border border-purple-300"
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70 text-right">
                    {new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {isOwn && (
                  <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs shadow">
                    You
                  </div>
                )}
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-xs">U</div>
              <div className="px-4 py-2 rounded-2xl bg-purple-100 border border-purple-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "100ms" }}></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-300 p-3 flex items-center gap-3 bg-purple-50">
          <input
            className="flex-1 p-3 rounded-full border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-800 placeholder-purple-400"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => {
              setNewMsg(e.target.value);
              if (activeUser?._id) socketRef.current?.emit("typing", { recipientId: activeUser._id });
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full transition shadow flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
