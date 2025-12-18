"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000").replace(/\/$/, "");

  // Initialize currentUser from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        setCurrentUser({ id: payload?.id, email: payload?.email });
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
  }, []);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Setup socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Strict guard: don't create new socket if one already exists and is connected
    if (socketRef.current?.connected) {
      return;
    }

    // Disconnect any existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(SOCKET_URL, { 
        query: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5
    });
    
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
        console.log("✅ Admin Connected to Socket:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
    });

    newSocket.on("userStatus", ({ userId, status }) => {
        setOnlineUsers(prev => {
            const newSet = new Set(prev);
            if (status === "online") newSet.add(String(userId));
            else newSet.delete(String(userId));
            return newSet;
        });
    });

    newSocket.on("typing", ({ senderId }) => {
        if (selectedUserRef.current && String(senderId) === String(selectedUserRef.current._id)) {
            setIsTyping(true);
        }
    });

    newSocket.on("stopTyping", ({ senderId }) => {
        if (selectedUserRef.current && String(senderId) === String(selectedUserRef.current._id)) {
            setIsTyping(false);
        }
    });

    // Listen for incoming messages
    newSocket.on("privateMessage", (msg) => {
         const currentSelected = selectedUserRef.current;
         
         // If we have a selected user, and this message involves them
         if (currentSelected) {
             const isRelevant = 
                (String(msg.senderId) === String(currentSelected._id)) || 
                (String(msg.recipientId) === String(currentSelected._id));
             
             if (isRelevant) {
                 setMessages(prev => {
                     if (!prev) return [msg];

                     // If this is a confirmed version of an optimistic message, try to replace by clientId
                     // BUT only if that optimistic message actually exists in our UI
                     if (msg.clientId) {
                       const optimisticMsgIndex = prev.findIndex((m) => String(m._id) === String(msg.clientId));
                       if (optimisticMsgIndex !== -1) {
                         return prev.map((m) =>
                           String(m._id) === String(msg.clientId) ? msg : m
                         );
                       }
                     }

                     // Dedup based on _id
                     const exists = prev.some(m => String(m._id) === String(msg._id));
                     if (exists) {
                       return prev;
                     }
                     return [...prev, msg];
                 });
                 // Clear typing indicator on message receive
                 setIsTyping(false);
             }
         }
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("userStatus");
      newSocket.off("typing");
      newSocket.off("stopTyping");
      newSocket.off("privateMessage");
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      socketRef.current = null;
    };
  }, [SOCKET_URL]);

  // Sync ref with state
  useEffect(() => {
      selectedUserRef.current = selectedUser;
      if (selectedUser) {
          fetchMessages(selectedUser._id);
          setIsTyping(false); // Reset typing status on user switch
      }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);


  const fetchUsers = async () => {
    setLoadingUsers(true);
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/api/users", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    } catch (e) { 
        console.error(e); 
    } finally {
        setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId) => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`/api/messages?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            const data = await res.json();
            setMessages(data);
        }
    } catch (e) { console.error(e); }
  };

  const handleTyping = (e) => {
      setNewMessage(e.target.value);
      
      if (!socket || !selectedUser) return;

      socket.emit("typing", { recipientId: selectedUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
          socket.emit("stopTyping", { recipientId: selectedUser._id });
      }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const text = newMessage.trim();
    setNewMessage("");
    
    // Stop typing immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) socket.emit("stopTyping", { recipientId: selectedUser._id });

    const clientId = Date.now().toString();

    // Optimistic update
    const tempMsg = {
        _id: clientId,
        clientId,
        text,
        senderId: currentUser?.id,
        recipientId: selectedUser._id,
        timestamp: new Date().toISOString(),
        pending: true
    };
    
    setMessages(prev => [...prev, tempMsg]);

    // Emit via socket for real-time delivery and persistence via chat server
    if (socket && socket.connected) {
        socket.emit("privateMessage", {
            recipientId: selectedUser._id,
            text,
            clientId,
        });
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4">
      {/* Users List */}
      <Card className={cn(
          "flex flex-col w-full md:w-1/3 transition-all", 
          selectedUser ? "hidden md:flex" : "flex"
      )}>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">Chats</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <>
              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted transition border-b last:border-0",
                    selectedUser?._id === user._id && "bg-muted"
                  )}
                >
                  <div className="relative">
                      <Avatar>
                         <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(String(user._id)) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">Click to chat</p>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">No users found</div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
          "flex-col flex-1 transition-all",
          !selectedUser ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={() => setSelectedUser(null)}
              >
                  <ArrowLeft className="h-5 w-5"/>
              </Button>
              <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{selectedUser.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(String(selectedUser._id)) && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
              </div>
              <div className="flex flex-col">
                  <div className="font-medium truncate">{selectedUser.email}</div>
                  {isTyping && <div className="text-xs text-primary animate-pulse">Typing...</div>}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-muted/20">
               {messages.length === 0 ? (
                   <div className="flex-1 flex items-center justify-center text-muted-foreground">No messages yet</div>
               ) : (
                   messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={cn(
                        "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm",
                        String(msg.senderId) === String(currentUser?.id)
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-white dark:bg-zinc-800 border"
                      )}
                    >
                      {msg.text}
                      <span className={cn("text-[10px] opacity-70 self-end", String(msg.senderId) === String(currentUser?.id) ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  ))
               )}
               {isTyping && (
                   <div className="flex justify-start">
                       <div className="bg-white dark:bg-zinc-800 border rounded-lg px-3 py-2 text-sm shadow-sm text-muted-foreground flex gap-1">
                           <span className="animate-bounce">.</span>
                           <span className="animate-bounce delay-100">.</span>
                           <span className="animate-bounce delay-200">.</span>
                       </div>
                   </div>
               )}
               <div ref={scrollRef} />
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={handleTyping}
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
            <div className="text-center">
                <p>Select a user to start chatting</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
