import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";
import { createPasswordHash } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid token and a password of at least 6 characters.",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "This reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(resetRecord.userId);

    if (!user || !user.active) {
      return NextResponse.json(
        { success: false, message: "This account is not available." },
        { status: 400 }
      );
    }

    user.passwordHash = createPasswordHash(password);
    await user.save();

    await PasswordResetToken.deleteMany({ userId: user._id });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset the password." },
      { status: 500 }
    );
  }
}
