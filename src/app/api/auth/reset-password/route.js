import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";

export async function POST(req) {
  await connectDB();
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });
  if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return NextResponse.json({ ok: true });
}


