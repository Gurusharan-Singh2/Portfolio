"use client";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Send, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const [newMsg, setNewMsg] = useState("");
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);

  const router = useRouter();
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  const messagesEndRef = useRef(null);

  const SOCKET_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000").replace(/\/$/, "");
  const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_ID || "6940e8fb7e042f29dcf61df0";

  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (!stored) router.push("/login");
      else setToken(stored);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      setUserId(payload?.id || null);
    } catch {
      router.push("/login");
    }
  }, [token, router]);

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

  useEffect(() => {
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

    socketRef.current = io(SOCKET_URL, { 
        query: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5
    });
    
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
    });

    socketRef.current.on("userStatus", ({ userId, status }) => {
        if (String(userId) === String(ADMIN_USER_ID)) {
            setIsAdminOnline(status === "online");
        }
    });

    socketRef.current.on("typing", ({ senderId }) => {
        if (String(senderId) === String(ADMIN_USER_ID)) {
            setIsTyping(true);
        }
    });

    socketRef.current.on("stopTyping", ({ senderId }) => {
        if (String(senderId) === String(ADMIN_USER_ID)) {
            setIsTyping(false);
        }
    });

    // Listen for chat history
    socketRef.current.on("chatHistory", (history) => {
      if (history && Array.isArray(history)) {
        queryClient.setQueryData(["messages", ADMIN_USER_ID], history);
      }
    });

    const handlePrivateMessage = (msg) => {
      const adminStr = String(ADMIN_USER_ID);
      const msgSenderStr = String(msg.senderId);
      const msgRecipientStr = String(msg.recipientId);
      
      // Check if message involves admin
      if (msgSenderStr === adminStr || msgRecipientStr === adminStr) {
        queryClient.setQueryData(["messages", ADMIN_USER_ID], (prev = []) => {
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

          // Deduplication based on _id
          const exists = prev.some((m) => String(m._id) === String(msg._id));
          if (exists) {
              return prev;
          }
          return [...prev, msg];
        });
        
        if (String(msg.senderId) === String(ADMIN_USER_ID)) {
            setIsTyping(false);
        }
      }
    };
    
    socketRef.current.on("privateMessage", handlePrivateMessage);

    return () => {
      console.log("🧹 Cleanup: Disconnecting socket");
      const socket = socketRef.current;
      if (socket) {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("userStatus");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("chatHistory");
        socket.off("privateMessage", handlePrivateMessage);
        if (socket.connected) {
          socket.disconnect();
        }
      }
      socketRef.current = null;
    };
  }, [token, ADMIN_USER_ID, SOCKET_URL]); // Removed queryClient from dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
      setNewMsg(e.target.value);
      
      if (!socketRef.current || !ADMIN_USER_ID) return;

      socketRef.current.emit("typing", { recipientId: ADMIN_USER_ID });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
          socketRef.current.emit("stopTyping", { recipientId: ADMIN_USER_ID });
      }, 2000);
  };

  const sendMessage = async () => {
    const text = newMsg.trim();
    if (!text) return;

    // Stop typing immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socketRef.current) socketRef.current.emit("stopTyping", { recipientId: ADMIN_USER_ID });

    const clientId = Date.now().toString();

    // Optimistic Update
    const tempMsg = {
        _id: clientId,
        clientId,
        text,
        senderId: userId,
        recipientId: ADMIN_USER_ID,
        timestamp: new Date().toISOString(),
        pending: true,
    };

    queryClient.setQueryData(["messages", ADMIN_USER_ID], (prev = []) => [...prev, tempMsg]);
    setNewMsg("");

    // Send via socket server so both user and admin receive in real-time (server also saves to DB)
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("privateMessage", {
        recipientId: ADMIN_USER_ID,
        text,
        clientId,
      });
    } else {
      console.error("❌ Socket not connected. Cannot send message. Socket state:", {
        exists: !!socketRef.current,
        connected: socketRef.current?.connected
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-neutral-900">
      <Card className="w-full max-w-4xl h-[85vh] shadow-xl flex flex-col border-none md:border">
        <CardHeader className="border-b px-6 py-4 flex flex-row items-center gap-4 bg-white dark:bg-card rounded-t-xl">
           <div className="relative">
               <Avatar className="h-10 w-10 border">
                  <AvatarFallback>AD</AvatarFallback>
               </Avatar>
               {isAdminOnline && (
                   <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
               )}
           </div>
           <div>
               <CardTitle className="text-lg">Support Chat</CardTitle>
               <div className="flex flex-col">
                   <p className="text-xs text-muted-foreground">Admin {isAdminOnline ? "• Online" : "• Offline"}</p>
                   {isTyping && <p className="text-xs text-primary animate-pulse">Typing...</p>}
               </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden relative bg-gray-50/50 dark:bg-neutral-950/50">
            <ScrollArea className="h-full w-full p-4">
                 {isHistoryLoading && (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground"/></div>
                 )}
                 <div className="flex flex-col gap-4 pb-4">
                    {messages.map((m) => {
                        const isOwn = String(m.senderId) === String(userId);
                        return (
                            <div key={m._id} className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm",
                                    isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-white dark:bg-neutral-800 border rounded-tl-sm"
                                )}>
                                    <p>{m.text}</p>
                                    <p className={cn("text-[10px] mt-1 text-right opacity-70", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                         {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {isTyping && (
                         <div className="flex justify-start">
                             <div className="bg-white dark:bg-neutral-800 border rounded-lg px-3 py-2 text-sm shadow-sm text-muted-foreground flex gap-1">
                                 <span className="animate-bounce">.</span>
                                 <span className="animate-bounce delay-100">.</span>
                                 <span className="animate-bounce delay-200">.</span>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
            </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white dark:bg-card rounded-b-xl gap-2">
             <Input 
                value={newMsg}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
             />
             <Button onClick={sendMessage} size="icon" className="rounded-full h-10 w-10">
                 <Send className="h-4 w-4" />
             </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
