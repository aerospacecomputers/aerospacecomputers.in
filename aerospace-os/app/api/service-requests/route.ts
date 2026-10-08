import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import ServiceRequest from "@/lib/models/ServiceRequest";

function generateRequestNumber() {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const time = now.getTime().toString().slice(-6);

  return `SR-${date}-${time}`;
}

// GET - Customer's service requests
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const filter =
      session.role === "customer"
        ? { customerId: session.userId }
        : {};

    const requests = await ServiceRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("GET service requests error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load service requests",
      },
      { status: 500 }
    );
  }
}

// POST - Customer creates a service request
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (session.role !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can create service requests",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.subject || !body.description) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject and description are required",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const serviceRequest = await ServiceRequest.create({
      customerId: session.userId,

      requestNumber: generateRequestNumber(),

      subject: body.subject.trim(),

      description: body.description.trim(),

      serviceType: body.serviceType?.trim() || "",

      deviceIds: Array.isArray(body.deviceIds)
        ? body.deviceIds
        : [],

      preferredDate: body.preferredDate
        ? new Date(body.preferredDate)
        : null,

      preferredTime: body.preferredTime || null,

      status: "submitted",

      attachmentUrls: Array.isArray(body.attachmentUrls)
        ? body.attachmentUrls
        : [],

      adminNotes: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service request submitted successfully",
        request: serviceRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST service request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create service request",
      },
      { status: 500 }
    );
  }
}
