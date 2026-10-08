
import mongoose, { Schema, Model } from "mongoose";

export type TicketStatus =
  | "created"
  | "assigned"
  | "accepted_by_engineer"
  | "travelling"
  | "on_site"
  | "working"
  | "waiting"
  | "completed"
  | "closed"
  | "cancelled";

export interface ITicket {
  ticketNumber: string;

  serviceRequestId: mongoose.Types.ObjectId;
  serviceOfferId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;

  engineerId?: mongoose.Types.ObjectId | null;

  status: TicketStatus;

  scheduledDate?: Date | null;
  scheduledTime?: string | null;

  approvedAmount: number;

  customerAcceptedAt?: Date | null;
  ticketCreatedAt: Date;

  engineerAssignedAt?: Date | null;

  adminNotes?: string | null;
  engineerNotes?: string | null;

  completedAt?: Date | null;
  closedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },

    serviceOfferId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceOffer",
      required: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    engineerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "created",
        "assigned",
        "accepted_by_engineer",
        "travelling",
        "on_site",
        "working",
        "waiting",
        "completed",
        "closed",
        "cancelled",
      ],
      default: "created",
      index: true,
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    scheduledTime: {
      type: String,
      default: null,
    },

    approvedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    customerAcceptedAt: {
      type: Date,
      default: null,
    },

    ticketCreatedAt: {
      type: Date,
      default: Date.now,
    },

    engineerAssignedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      default: null,
    },

    engineerNotes: {
      type: String,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket: Model<ITicket> =
  mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
