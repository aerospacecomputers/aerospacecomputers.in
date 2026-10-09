import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import ServiceOffer from "@/lib/models/ServiceOffer";
import ServiceRequest from "@/lib/models/ServiceRequest";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "customer") return NextResponse.json({ success: false, message: "Customer access required" }, { status: 403 });
    await connectMongoDB();
    const offers = await ServiceOffer.find({ customerId: session.userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error("Customer offers GET error:", error);
    return NextResponse.json({ success: false, message: "Unable to load service offers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "customer") return NextResponse.json({ success: false, message: "Customer access required" }, { status: 403 });
    const body = await request.json();
    const offerId = String(body.offerId || "");
    const actionValue = String(body.action || "");
    const action = actionValue as "accepted" | "rejected" | "change_requested";
    const responseText = String(body.response || "").trim();
    if (!mongoose.isValidObjectId(offerId)) return NextResponse.json({ success: false, message: "Invalid offer ID" }, { status: 400 });
    if (!["accepted", "rejected", "change_requested"].includes(actionValue)) return NextResponse.json({ success: false, message: "Choose accept, reject, or request a change" }, { status: 400 });
    if (action === "change_requested" && !responseText) return NextResponse.json({ success: false, message: "Please explain what change you need" }, { status: 400 });

    await connectMongoDB();
    const offer = await ServiceOffer.findOne({ _id: offerId, customerId: session.userId });
    if (!offer) return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    if (offer.status !== "sent") return NextResponse.json({ success: false, message: "This offer has already been responded to or is no longer available" }, { status: 409 });

    const serviceRequest = await ServiceRequest.findOne({ _id: offer.serviceRequestId, customerId: session.userId });
    if (!serviceRequest) return NextResponse.json({ success: false, message: "Related service request not found" }, { status: 404 });

    offer.status = action;
    offer.customerResponse = responseText || null;
    offer.customerRespondedAt = new Date();
    await offer.save();

    if (action === "accepted") serviceRequest.status = "accepted";
    else if (action === "rejected") serviceRequest.status = "rejected";
    else serviceRequest.status = "customer_action_required";
    await serviceRequest.save();

    return NextResponse.json({ success: true, message: action === "accepted" ? "Offer accepted. The admin will create a ticket next." : action === "rejected" ? "Offer rejected." : "Change request sent to the admin.", offer, request: serviceRequest });
  } catch (error) {
    console.error("Customer offer response error:", error);
    return NextResponse.json({ success: false, message: "Unable to submit your response" }, { status: 500 });
  }
}
