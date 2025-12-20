import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { verifyToken } from "@/lib/auth"; 
import Setting from "@/models/Setting";
import connectToDatabase from "@/lib/mongo";

export async function POST(req) {
  try {
    await connectToDatabase();
    // 1. Authenticate user
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token); 
    if (!user) {
       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Get Price
    let amount = 199;
    const priceSetting = await Setting.findOne({ key: "subscription_price" });
    if (priceSetting) {
        amount = Number(priceSetting.value);
    }
    
    const currency = "INR";

    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: `rcpt_${Date.now()}`.substring(0, 40),
    };

    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment service not configured (missing keys)" },
        { status: 503 }
      );
    }

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
