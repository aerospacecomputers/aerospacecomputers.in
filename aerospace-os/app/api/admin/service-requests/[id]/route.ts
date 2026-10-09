import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import ServiceRequest from "@/lib/models/ServiceRequest";
import ServiceOffer from "@/lib/models/ServiceOffer";
import User from "@/lib/models/User";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid request ID" }, { status: 400 });

    await connectMongoDB();
    const serviceRequest = await ServiceRequest.findById(id).lean();
    if (!serviceRequest) return NextResponse.json({ success: false, message: "Service request not found" }, { status: 404 });

    const [customer, offer] = await Promise.all([
      User.findById(serviceRequest.customerId).select("name email phone customerType companyId").lean(),
      ServiceOffer.findOne({ serviceRequestId: serviceRequest._id }).sort({ createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({ success: true, request: serviceRequest, customer, offer });
  } catch (error) {
    console.error("Admin request detail error:", error);
    return NextResponse.json({ success: false, message: "Unable to load service request" }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const session = await getCurrentSession();
    if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (session.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, message: "Invalid request ID" }, { status: 400 });

    const body = await request.json();
    const proposedDate = new Date(String(body.proposedDate || ""));
    const proposedTime = String(body.proposedTime || "").trim();
    const notes = String(body.notes || "").trim();
    const chargeKeys = ["labourCharges", "installationMaterial", "travelCharges", "otherCharges"] as const;
    const charges = Object.fromEntries(chargeKeys.map((key) => [key, Number(body[key] ?? 0)])) as Record<(typeof chargeKeys)[number], number>;
    const gstPercentage = Number(body.gstPercentage ?? 18);

    if (!Number.isFinite(proposedDate.getTime()) || !proposedTime) {
      return NextResponse.json({ success: false, message: "Proposed date and time are required" }, { status: 400 });
    }
    if (chargeKeys.some((key) => !Number.isFinite(charges[key]) || charges[key] < 0) || !Number.isFinite(gstPercentage) || gstPercentage < 0 || gstPercentage > 100) {
      return NextResponse.json({ success: false, message: "Charges and GST must be valid non-negative numbers" }, { status: 400 });
    }

    await connectMongoDB();
    const serviceRequest = await ServiceRequest.findById(id);
    if (!serviceRequest) return NextResponse.json({ success: false, message: "Service request not found" }, { status: 404 });
    if (!["submitted", "under_review", "quote_sent", "customer_action_required"].includes(serviceRequest.status)) {
      return NextResponse.json({ success: false, message: "This request is not currently eligible for an offer" }, { status: 409 });
    }

    const customer = await User.findById(serviceRequest.customerId).select("name email active").lean();
    if (!customer || !customer.active) return NextResponse.json({ success: false, message: "Active customer account not found" }, { status: 404 });

    const subtotal = chargeKeys.reduce((sum, key) => sum + charges[key], 0);
    const gstAmount = Math.round(subtotal * gstPercentage) / 100;
    const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

    const offer = await ServiceOffer.create({
      serviceRequestId: serviceRequest._id,
      customerId: serviceRequest.customerId,
      proposedDate,
      proposedTime,
      ...charges,
      subtotal,
      gstPercentage,
      gstAmount,
      totalAmount,
      notes,
      status: "sent",
    });

    serviceRequest.status = "quote_sent";
    await serviceRequest.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://os.aerospacecomputers.in";
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Aerospace OS <onboarding@resend.dev>";
    let emailSent = false;
    if (resendApiKey) {
      try {
        const dateLabel = proposedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromEmail,
            to: [customer.email],
            subject: `Service offer for ${serviceRequest.requestNumber}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#173a5b"><h2 style="color:#0875bf">Aerospace OS</h2><p>Hello ${customer.name},</p><p>An offer has been prepared for service request <strong>${serviceRequest.requestNumber}</strong> — ${serviceRequest.subject}.</p><p><strong>Proposed schedule:</strong> ${dateLabel} at ${proposedTime}</p><p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}<br/><strong>GST (${gstPercentage}%):</strong> ₹${gstAmount.toFixed(2)}<br/><strong>Total:</strong> ₹${totalAmount.toFixed(2)}</p><p>Please sign in to Aerospace OS to review the offer and respond.</p><p><a href="${baseUrl}/login" style="display:inline-block;background:#0875bf;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700">Open Aerospace OS</a></p></div>`,
          }),
        });
        emailSent = emailResponse.ok;
        if (!emailSent) console.error("Service offer email failed:", await emailResponse.text());
      } catch (emailError) {
        console.error("Service offer email error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? "Offer sent and customer notified by email." : "Offer saved and marked sent, but email delivery could not be confirmed. Verify Resend settings before relying on email notification.",
      offer,
      emailSent,
    }, { status: 201 });
  } catch (error) {
    console.error("Admin offer creation error:", error);
    return NextResponse.json({ success: false, message: "Unable to create service offer" }, { status: 500 });
  }
}
