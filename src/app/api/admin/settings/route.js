import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import Setting from "@/models/Setting";
import connectToDatabase from "@/lib/mongo";

export async function GET(req) {
  try {
    await connectToDatabase();
    
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const price = await Setting.findOne({ key: "subscription_price" });
    const duration = await Setting.findOne({ key: "subscription_duration" });

    return NextResponse.json({ 
        subscription_price: price ? price.value : 199,
        subscription_duration: duration ? duration.value : 30
    });
  } catch (err) {
    console.error("Error fetching settings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { subscription_price, subscription_duration } = await req.json();

    if (subscription_price !== undefined) {
        await Setting.findOneAndUpdate(
            { key: "subscription_price" },
            { value: subscription_price },
            { upsert: true, new: true }
        );
    }

    if (subscription_duration !== undefined) {
        await Setting.findOneAndUpdate(
            { key: "subscription_duration" },
            { value: subscription_duration },
            { upsert: true, new: true }
        );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
