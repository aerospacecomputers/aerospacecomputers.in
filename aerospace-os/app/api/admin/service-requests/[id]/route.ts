import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/auth";
import ServiceRequest from "@/lib/models/ServiceRequest";
import ServiceOffer from "@/lib/models/ServiceOffer";
import User from "@/lib/models/User";
import Ticket from "@/lib/models/Ticket";

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

    const [customer, offers, ticket, engineers] = await Promise.all([
      User.findById(serviceRequest.customerId).select("name email phone customerType companyId").lean(),
      ServiceOffer.find({ serviceRequestId: serviceRequest._id }).sort({ createdAt: 1 }).lean(),
      Ticket.findOne({ serviceRequestId: serviceRequest._id }).lean(),
      User.find({ role: "engineer", active: true }).select("_id name email phone").sort({ name: 1 }).lean(),
    ]);
    const offer = offers.length ? offers[offers.length - 1] : null;

    return NextResponse.json({ success: true, request: serviceRequest, customer, offer, offers, ticket, engineers });
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

    if (body.action === "assign_engineer") {
      const engineerId = String(body.engineerId || "");
      if (!mongoose.isValidObjectId(engineerId)) {
        return NextResponse.json({ success: false, message: "Choose a valid engineer" }, { status: 400 });
      }

      await connectMongoDB();
      const serviceRequest = await ServiceRequest.findById(id);
      if (!serviceRequest) return NextResponse.json({ success: false, message: "Service request not found" }, { status: 404 });

      const ticket = await Ticket.findOne({ serviceRequestId: serviceRequest._id });
      if (!ticket) return NextResponse.json({ success: false, message: "Create the ticket before assigning an engineer" }, { status: 409 });
      if (["completed", "closed", "cancelled"].includes(ticket.status)) {
        return NextResponse.json({ success: false, message: "A completed, closed, or cancelled ticket cannot be assigned" }, { status: 409 });
      }

      const engineer = await User.findOne({ _id: engineerId, role: "engineer", active: true }).select("_id name email");
      if (!engineer) return NextResponse.json({ success: false, message: "Active engineer account not found" }, { status: 404 });

      ticket.engineerId = engineer._id;
      ticket.status = "assigned";
      ticket.engineerAssignedAt = new Date();
      await ticket.save();

      serviceRequest.status = "assigned";
      await serviceRequest.save();

      return NextResponse.json({
        success: true,
        message: `Ticket ${ticket.ticketNumber} assigned to ${engineer.name}. The engineer can now review the ticket.`,
        ticket,
        engineer,
      });
    }

    if (body.action === "create_ticket") {
      await connectMongoDB();
      const serviceRequest = await ServiceRequest.findById(id);
      if (!serviceRequest) return NextResponse.json({ success: false, message: "Service request not found" }, { status: 404 });

      const existingTicket = await Ticket.findOne({ serviceRequestId: serviceRequest._id });
      if (existingTicket) {
        return NextResponse.json({ success: false, message: "A ticket already exists for this service request", ticket: existingTicket }, { status: 409 });
      }
      if (serviceRequest.status !== "accepted") {
        return NextResponse.json({ success: false, message: "The customer must accept an offer before a ticket can be created" }, { status: 409 });
      }

      const acceptedOffer = await ServiceOffer.findOne({
        serviceRequestId: serviceRequest._id,
        customerId: serviceRequest.customerId,
        status: "accepted",
      }).sort({ customerRespondedAt: -1, createdAt: -1 });
      if (!acceptedOffer) {
        return NextResponse.json({ success: false, message: "No customer-accepted offer was found for this request" }, { status: 409 });
      }

      const ticketNumber = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
      const ticket = await Ticket.create({
        ticketNumber,
        serviceRequestId: serviceRequest._id,
        serviceOfferId: acceptedOffer._id,
        customerId: serviceRequest.customerId,
        engineerId: null,
        status: "created",
        scheduledDate: acceptedOffer.proposedDate,
        scheduledTime: acceptedOffer.proposedTime,
        approvedAmount: acceptedOffer.totalAmount,
        customerAcceptedAt: acceptedOffer.customerRespondedAt || new Date(),
        ticketCreatedAt: new Date(),
      });

      serviceRequest.status = "ticket_created";
      await serviceRequest.save();

      return NextResponse.json({
        success: true,
        message: "Ticket created from the customer's accepted offer. Engineer assignment is still pending.",
        ticket,
      }, { status: 201 });
    }

    if (body.action === "agree_customer_price") {
      const totalAmount = Number(body.totalAmount);
      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        return NextResponse.json({ success: false, message: "The customer's requested price must be a valid positive amount" }, { status: 400 });
      }

      await connectMongoDB();
      const serviceRequest = await ServiceRequest.findById(id);
      if (!serviceRequest) return NextResponse.json({ success: false, message: "Service request not found" }, { status: 404 });
      if (!["quote_sent", "customer_action_required"].includes(serviceRequest.status)) {
        return NextResponse.json({ success: false, message: "This request has no customer offer awaiting a price decision" }, { status: 409 });
      }

      const previousOffer = await ServiceOffer.findOne({ serviceRequestId: serviceRequest._id, customerId: serviceRequest.customerId }).sort({ createdAt: -1 });
      if (!previousOffer || previousOffer.status !== "change_requested" || !previousOffer.customerResponse) {
        return NextResponse.json({ success: false, message: "There is no customer price request to accept" }, { status: 409 });
      }

      const priceMatch = previousOffer.customerResponse.match(/(?:₹|INR\s*|Rs\.?\s*)([0-9][0-9,]*(?:\.[0-9]{1,2})?)|([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:rupees|INR|Rs\.?)/i);
      const requestedRaw = priceMatch?.[1] || priceMatch?.[2];
      const requestedPrice = requestedRaw ? Number(requestedRaw.replace(/,/g, "")) : NaN;
      if (!Number.isFinite(requestedPrice) || requestedPrice <= 0 || Math.abs(requestedPrice - totalAmount) > 0.01) {
        return NextResponse.json({ success: false, message: "The agreed amount must match a clear price written in the customer's response (for example ₹500 or Rs. 500)." }, { status: 400 });
      }

      const gstPercentage = previousOffer.gstPercentage ?? 18;
      const subtotal = Math.round((totalAmount / (1 + gstPercentage / 100)) * 100) / 100;
      const gstAmount = Math.round((totalAmount - subtotal) * 100) / 100;
      const revisedOffer = await ServiceOffer.create({
        serviceRequestId: serviceRequest._id,
        customerId: serviceRequest.customerId,
        proposedDate: previousOffer.proposedDate,
        proposedTime: previousOffer.proposedTime,
        labourCharges: subtotal,
        installationMaterial: 0,
        travelCharges: 0,
        otherCharges: 0,
        subtotal,
        gstPercentage,
        gstAmount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        notes: "Revised total agreed by the admin based on the customer's price request. This offer is awaiting customer confirmation.",
        status: "sent",
      });

      serviceRequest.status = "quote_sent";
      await serviceRequest.save();
      return NextResponse.json({
        success: true,
        message: "Agreed price saved as a revised offer and made available to the customer for confirmation. No ticket was created.",
        offer: revisedOffer,
        emailSent: false,
      }, { status: 201 });
    }

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
