import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/user";
import Setting from "@/models/Setting";
import connectToDatabase from "@/lib/mongo";
import { verifyToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectToDatabase();
    
    // 1. Authenticate user
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decodedUser = verifyToken(token);
    if (!decodedUser) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // 3. Get subscription duration from settings
      const durationSetting = await Setting.findOne({ key: "subscription_duration" });
      const daysToAdd = durationSetting ? Number(durationSetting.value) : 30;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysToAdd);

      await User.findByIdAndUpdate(decodedUser.id, {
        isSubscribed: true,
        subscriptionId: razorpay_payment_id,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
      });

      return NextResponse.json({ success: true, message: "Subscription verified" });
    } else {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
