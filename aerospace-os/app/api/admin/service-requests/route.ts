import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import ServiceRequest from "@/lib/models/ServiceRequest";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const requests = await ServiceRequest.find({})
      .populate("customerId", "name email phone role customerType companyId")
      .populate("deviceIds", "name deviceType brand model serialNumber location")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Admin service requests error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load service requests" },
      { status: 500 }
    );
  }
}
