import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import User from "@/models/user";
import Setting from "@/models/Setting";
import connectToDatabase from "@/lib/mongo";

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Admin check
    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await User.find({})
      .select("email isAdmin dailyQuizCount lastQuizDate isSubscribed subscriptionId subscriptionStartDate subscriptionEndDate createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectToDatabase();

    const admin = verifyAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isSubscribed } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.isSubscribed = isSubscribed;
    // If manually subscribing, use configured duration
    if (isSubscribed) {
        user.subscriptionId = user.subscriptionId || "MANUAL_BY_ADMIN";
        if (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) < new Date()) {
             // Get configured duration
             const durationSetting = await Setting.findOne({ key: "subscription_duration" });
             const daysToAdd = durationSetting ? Number(durationSetting.value) : 30;
             
             user.subscriptionStartDate = new Date();
             const end = new Date();
             end.setDate(end.getDate() + daysToAdd);
             user.subscriptionEndDate = end;
        }
    } else {
        user.subscriptionId = null;
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
    }
    
    await user.save();

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
