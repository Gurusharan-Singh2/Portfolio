import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongo";
import User from "@/models/user";
import sendEmail from "@/utils/Email";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await User.findOne({ email });
  // Always respond success to avoid user enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  user.resetToken = token;
  user.resetTokenExpires = expires;
  await user.save();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    message: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${link}">${link}</a></p>`,
    replyTo: user.email,
  });

  return NextResponse.json({ ok: true });
}


