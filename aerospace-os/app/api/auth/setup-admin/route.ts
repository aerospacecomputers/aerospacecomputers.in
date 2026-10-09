import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/auth";

function secretsMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.ADMIN_SETUP_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { success: false, message: "Admin setup is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const setupSecret = String(body.setupSecret || "");
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!secretsMatch(setupSecret, expectedSecret)) {
      return NextResponse.json(
        { success: false, message: "Invalid setup authorization" },
        { status: 403 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        { success: false, message: "Use a password with at least 12 characters" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const existingAdmin = await User.findOne({ role: "admin" }).select("_id");
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "An admin account already exists. First-admin setup is locked." },
        { status: 409 }
      );
    }

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Use a different email." },
        { status: 409 }
      );
    }

    await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
      role: "admin",
      active: true,
    });

    return NextResponse.json(
      { success: true, message: "Admin account created. You can now sign in at /login." },
      { status: 201 }
    );
  } catch (error) {
    console.error("First admin setup error:", error);
    return NextResponse.json(
      { success: false, message: "Could not create the admin account" },
      { status: 500 }
    );
  }
}
