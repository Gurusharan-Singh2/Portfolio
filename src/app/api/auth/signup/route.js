import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";

export async function POST(req) {
  await connectDB();
  const { email, password, isAdmin } = await req.json();

  if (await User.findOne({ email })) return NextResponse.json({ error: "User exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  // If no users exist yet, make the first user an admin automatically
  const totalUsers = await User.estimatedDocumentCount();
  const shouldBeAdmin = totalUsers === 0 ? true : !!isAdmin;

  const user = await User.create({ email, password: hashed, isAdmin: shouldBeAdmin });
  const token = generateToken(user);

  return NextResponse.json({ token, user: { id: user._id, email: user.email, isAdmin: user.isAdmin } });
}
