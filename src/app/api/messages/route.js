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

export async function DELETE(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ids = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length) return NextResponse.json({ error: "No message ids provided" }, { status: 400 });

  // Load candidate messages
  const candidates = await Message.find({ _id: { $in: ids } });

  // Authorization rules
  const allowedIds = candidates
    .filter((m) => {
      const senderMatches = String(m.senderId) === String(decoded.id);
      const recipientMatches = String(m.recipientId) === String(decoded.id);
      if (decoded.isAdmin) return senderMatches || recipientMatches;
      return senderMatches;
    })
    .map((m) => String(m._id));

  if (!allowedIds.length) return NextResponse.json({ deletedCount: 0, deletedIds: [] });

  const result = await Message.deleteMany({ _id: { $in: allowedIds } });
  return NextResponse.json({ deletedCount: result.deletedCount || 0, deletedIds: allowedIds });
}
