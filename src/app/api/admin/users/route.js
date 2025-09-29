import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";
import { verifyToken } from "@/lib/auth";

export async function GET(req) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!decoded.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await User.find({ isAdmin: false }).select("_id email");
  return NextResponse.json(users);
}
