import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import Ticket from "@/lib/models/Ticket";
import ServiceRequest from "@/lib/models/ServiceRequest";
import User from "@/lib/models/User";

const allowed = ["accepted_by_engineer", "travelling", "on_site", "working", "waiting", "completed"];

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  if (session.role !== "engineer") return NextResponse.json({ success: false, message: "Engineer access required" }, { status: 403 });
  try {
    await connectMongoDB();
    const engineer = await User.findById(session.userId).select("name email").lean();
    const tickets = await Ticket.find({ engineerId: session.userId })
      .populate({ path: "serviceRequestId", select: "requestNumber subject description serviceType preferredDate preferredTime status" })
      .populate({ path: "customerId", select: "name email phone customerType companyId" })
      .sort({ engineerAssignedAt: -1, updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, engineer: engineer ? { name: engineer.name, email: engineer.email } : null, tickets });
  } catch (error) {
    console.error("Engineer tickets GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load assigned tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  if (session.role !== "engineer") return NextResponse.json({ success: false, message: "Engineer access required" }, { status: 403 });
  try {
    const body = await request.json();
    const ticketId = String(body.ticketId || "");
    const status = String(body.status || "");
    if (!mongoose.isValidObjectId(ticketId)) return NextResponse.json({ success: false, message: "Invalid ticket ID" }, { status: 400 });
    if (!allowed.includes(status)) return NextResponse.json({ success: false, message: "Invalid ticket status" }, { status: 400 });
    await connectMongoDB();
    const ticket = await Ticket.findOne({ _id: ticketId, engineerId: session.userId });
    if (!ticket) return NextResponse.json({ success: false, message: "Ticket not found in your assigned work" }, { status: 404 });
    const transitions: Record<string, string[]> = {
      assigned: ["accepted_by_engineer"],
      accepted_by_engineer: ["travelling", "on_site", "working", "waiting", "completed"],
      travelling: ["on_site", "working", "waiting", "completed"],
      on_site: ["working", "waiting", "completed"],
      working: ["waiting", "completed"],
      waiting: ["travelling", "on_site", "working", "completed"],
      completed: [],
    };
    if (!transitions[ticket.status]?.includes(status)) return NextResponse.json({ success: false, message: "That status change is not allowed" }, { status: 409 });
    ticket.status = status as typeof ticket.status;
    if (typeof body.engineerNotes === "string") ticket.engineerNotes = body.engineerNotes.trim().slice(0, 3000);
    if (status === "completed") ticket.completedAt = new Date();
    await ticket.save();
    const serviceRequest = await ServiceRequest.findById(ticket.serviceRequestId);
    if (serviceRequest) {
      serviceRequest.status = status === "completed" ? "completed" : "in_progress";
      await serviceRequest.save();
    }
    return NextResponse.json({ success: true, message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Engineer ticket update error:", error);
    return NextResponse.json({ success: false, message: "Unable to update ticket" }, { status: 500 });
  }
}
