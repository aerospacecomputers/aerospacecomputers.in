import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession, hashPassword } from "@/lib/auth";
import User from "@/lib/models/User";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    await connectMongoDB();
    const engineers = await User.find({ role: "engineer" })
      .select("name email phone active createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, engineers });
  } catch (error) {
    console.error("Admin engineers GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load engineer accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, email and temporary password are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 12) {
      return NextResponse.json({ success: false, message: "Password must be at least 12 characters" }, { status: 400 });
    }

    await connectMongoDB();
    const existing = await User.findOne({ email }).select("_id").lean();
    if (existing) return NextResponse.json({ success: false, message: "An account with this email already exists" }, { status: 409 });

    const engineer = await User.create({
      name,
      email,
      phone: phone || undefined,
      passwordHash: hashPassword(password),
      role: "engineer",
      active: true,
      companyId: null,
      customerType: "individual",
    });

    return NextResponse.json({
      success: true,
      message: "Engineer account created successfully. Share the login URL and temporary password securely.",
      engineer: { _id: engineer._id, name: engineer.name, email: engineer.email, phone: engineer.phone, active: engineer.active, createdAt: engineer.createdAt },
    }, { status: 201 });
  } catch (error) {
    console.error("Admin engineer creation error:", error);
    return NextResponse.json({ success: false, message: "Unable to create engineer account" }, { status: 500 });
  }
}
