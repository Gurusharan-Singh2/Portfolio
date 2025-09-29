import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });

  const token = generateToken(user);
  return NextResponse.json({ token, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });
}
