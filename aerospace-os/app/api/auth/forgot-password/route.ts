import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import PasswordResetToken from "@/lib/models/PasswordResetToken";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please enter your email address." },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.findOne({ email, active: true });

    // Do not reveal whether an email exists.
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent.",
      });
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://os.aerospacecomputers.in";
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "Aerospace OS <onboarding@resend.dev>";

    if (resendApiKey) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [user.email],
          subject: "Reset your Aerospace OS password",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#173a5b">
              <h2 style="color:#0875bf">Aerospace OS</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to reset your Aerospace OS password.</p>
              <p>
                <a href="${resetUrl}" style="display:inline-block;background:#0875bf;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:700">
                  Reset Password
                </a>
              </p>
              <p>This link expires in 30 minutes.</p>
              <p>If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Password reset email failed:", await emailResponse.text());
      }
    } else {
      console.warn("RESEND_API_KEY is not configured. Reset URL:", resetUrl);
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to process the request." },
      { status: 500 }
    );
  }
}
