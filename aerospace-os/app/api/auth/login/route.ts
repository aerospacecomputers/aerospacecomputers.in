import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { checkPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        {
          success: false,
          message: "This account is inactive",
        },
        { status: 403 }
      );
    }

    const passwordValid = checkPassword(
      password,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    await setSessionCookie(
      user._id.toString(),
      user.role
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId ?? null,
        customerType: user.customerType ?? "individual",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 }
    );
  }
}
