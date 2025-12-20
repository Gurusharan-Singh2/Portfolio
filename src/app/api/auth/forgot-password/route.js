import { NextResponse } from "next/server";
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

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

  user.resetToken = otp;
  user.resetTokenExpires = expires;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    message: `<p>Your password reset code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
    replyTo: user.email,
  });

  return NextResponse.json({ ok: true });
}


