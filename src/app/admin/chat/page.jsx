"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Send, X } from "lucide-react";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  // Load token and admin ID
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return;
    setToken(stored);
    try {
      const payload = JSON.parse(atob(stored.split(".")[1] || ""));
      if (payload?.isAdmin) setAdminId(payload.id);
    } catch(error){
      console.error("Invalid token", error);
    };
    
  }, []);

  // Fetch users
  useEffect(() => {
    if (!token) return;
    axios
      .get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUsers(res.data);
        if (res.data.length && !activeUser) setActiveUser(res.data[0]);
      });
  }, [token, activeUser]);

  // Fetch chat history
  useEffect(() => {
    if (!token || !activeUser?._id) return;
    setIsHistoryLoading(true);
    axios
      .get(`/api/messages?userId=${activeUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data))
      .finally(() => setIsHistoryLoading(false));
  }, [token, activeUser]);

  // Socket setup
  useEffect(() => {
    if (!token) return;
    if (!socketRef.current) socketRef.current = io(SOCKET_URL, { query: { token } });

    const onMsg = (m) => {
      const activeId = activeUser?._id ? String(activeUser._id) : null;
      if ([m.senderId, m.recipientId].map(String).includes(activeId)) {
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
      socketRef.current?.off("privateMessage", onMsg);
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [token, SOCKET_URL, activeUser]);

  // Scroll to bottom
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isTyping]);

  const sendMessage = () => {
    if (!newMsg.trim() || !activeUser?._id) return;
    socketRef.current?.emit("privateMessage", { recipientId: activeUser._id, text: newMsg.trim() });
    setMessages((prev) => [
      ...prev,
      {
        _id: `local-${Date.now()}`,
        senderId: adminId,
        recipientId: activeUser._id,
        text: newMsg.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMsg("");
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const deleteSelected = async () => {
    if (!selectedIds.size) return;
    try {
      const ids = Array.from(selectedIds);
      await axios.delete("/api/messages", { headers: { Authorization: `Bearer ${token}` }, data: { ids } });
      setMessages((prev) => prev.filter((m) => !selectedIds.has(String(m._id))));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch {
      alert("Failed to delete messages");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full sm:w-screen bg-gradient-to-b from-violet-200 via-purple-200 to-indigo-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-violet-50 rounded-2xl shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-100">
        <div className="p-4 border-b border-purple-200 font-semibold text-purple-700 text-lg">Users</div>
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

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex h-screen">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-lg text-purple-700">Users</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X className="w-6 h-6 text-purple-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    setActiveUser(u);
                    setDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 text-left w-full hover:bg-purple-100 transition rounded-lg ${
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
          </div>
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-violet-300 to-purple-300 rounded-2xl shadow-lg overflow-hidden h-screen w-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-purple-300 font-semibold text-purple-800 flex items-center justify-between sticky top-0 bg-violet-300 z-10">
          <div className="flex-1 min-w-0">
            <span className="truncate block">{activeUser ? `Chat with ${activeUser.email}` : "Select a user"}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="md:hidden px-3 py-1 rounded-md bg-purple-200 hover:bg-purple-300" onClick={() => setDrawerOpen(true)}>
              Users
            </button>
            <button
              onClick={() => {
                setSelectMode(!selectMode);
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
                className={`px-3 py-1 rounded-md text-sm text-white ${
                  selectedIds.size ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Delete ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
          {isHistoryLoading && (
            <div className="w-full flex justify-center py-6 text-purple-700 animate-pulse">Loading messages...</div>
          )}
          {messages.map((m) => {
            const isOwn = String(m.senderId) === String(adminId);
            return (
              <div key={m._id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                {selectMode && (
                  <input type="checkbox" className="mt-auto mb-1" checked={selectedIds.has(String(m._id))} onChange={() => toggleSelect(String(m._id))} />
                )}
                {!isOwn && (
                  <div className="h-8 w-8 rounded-full bg-purple-300 text-purple-700 flex items-center justify-center text-xs">U</div>
                )}
                <div
                  className={`
                    px-4 py-2 rounded-2xl text-sm shadow
                    ${isOwn
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-none"
                      : "bg-purple-100 text-purple-900 rounded-bl-none border border-purple-300"
                    }
                    w-auto max-w-[90%] sm:max-w-[70%] break-words
                  `}
                >
                  <div>{m.text}</div>
                  <div className="mt-1 text-[10px] opacity-70 text-right">
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
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center text-xs">U</div>
              <div className="px-4 py-2 rounded-2xl bg-purple-100 border border-purple-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-300 p-3 flex items-center gap-3 bg-purple-50 sticky bottom-0 w-full z-10">
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
