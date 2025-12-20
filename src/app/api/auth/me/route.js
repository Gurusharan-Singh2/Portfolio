import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongo";

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Get token from cookie or header
    const token = req.headers.get("authorization")?.split(" ")[1] || 
                  req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(decoded.id).select("-password -resetToken");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if we need to reset daily count (soft check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastQuizDate = new Date(user.lastQuizDate || 0);
    lastQuizDate.setHours(0, 0, 0, 0);

    if (lastQuizDate < today) {
        user.dailyQuizCount = 0;
        // user.save() is optional here for GET, but good for consistency. 
        // We'll skip save on GET to be safe/fast, it updates on generation.
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
