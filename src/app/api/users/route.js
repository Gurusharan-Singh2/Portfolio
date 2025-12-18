import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await User.find({ _id: { $ne: decoded.id } }).select("-password");
  return NextResponse.json(users);
}
