// /app/api/messages/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  const messages = await Message.find({
    $or: [
      { senderId: decoded.id, recipientId: userId },
      { senderId: userId, recipientId: decoded.id },
    ],
  }).sort({ timestamp: 1 });

  return NextResponse.json(messages);
}
