// /app/api/messages/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Message from "@/models/Message";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, recipientId: rawRecipientId } = await req.json();
  const recipientId = rawRecipientId?.replace(/^"|"$/g, '');

  if (!text || !recipientId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  let senderObjId, recipientObjId;
  try {
    senderObjId = new mongoose.Types.ObjectId(decoded.id);
    recipientObjId = new mongoose.Types.ObjectId(recipientId);
  } catch {
    return NextResponse.json({ error: "Invalid senderId or recipientId" }, { status: 400 });
  }

  const message = await Message.create({
    senderId: senderObjId,
    recipientId: recipientObjId,
    senderEmail: decoded.email,
    text,
  });

  return NextResponse.json(message);
}

export async function GET(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  let userId = url.searchParams.get("userId");
  
  // Sanitize userId if it has quotes
  if (userId) {
      userId = userId.replace(/^"|"$/g, '');
  }

  if (!userId) {
      return NextResponse.json([]);
  }

  let decodedObjId, userObjId;
  try {
    decodedObjId = new mongoose.Types.ObjectId(decoded.id);
    userObjId = new mongoose.Types.ObjectId(userId);
  } catch {
    return NextResponse.json([]);
  }

  const messages = await Message.find({
    $or: [
      { senderId: decodedObjId, recipientId: userObjId },
      { senderId: userObjId, recipientId: decodedObjId },
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
