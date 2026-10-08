import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import CustomerProfile from "@/lib/models/CustomerProfile";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const password = body.password;
    const customerType = body.customerType;
    const companyName = body.companyName?.trim() || "";

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, phone and password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    if (
      customerType !== "individual" &&
      customerType !== "business"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer type",
        },
        { status: 400 }
      );
    }

    if (customerType === "business" && !companyName) {
      return NextResponse.json(
        {
          success: false,
          message: "Company name is required for business customers",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "customer",
      companyId: null,
      customerType,
      phone,
      active: true,
    });

    try {
      await CustomerProfile.create({
        userId: user._id,
        customerType,
        companyId: null,
        companyName:
          customerType === "business" ? companyName : null,
        contactPerson: name,
        phone,
        email,
      });
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Customer account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create customer account",
      },
      { status: 500 }
    );
  }
}
