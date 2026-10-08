import mongoose, { Schema, Model } from "mongoose";

export type ServiceRequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "quote_sent"
  | "customer_action_required"
  | "accepted"
  | "rejected"
  | "ticket_created"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";

export interface IServiceRequest {
  customerId: mongoose.Types.ObjectId;

  requestNumber: string;

  subject: string;
  description: string;

  serviceType?: string;

  deviceIds?: mongoose.Types.ObjectId[];

  preferredDate?: Date | null;
  preferredTime?: string | null;

  status: ServiceRequestStatus;

  attachmentUrls?: string[];

  adminNotes?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requestNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    serviceType: {
      type: String,
      default: "",
      trim: true,
    },

    deviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
      },
    ],

    preferredDate: {
      type: Date,
      default: null,
    },

    preferredTime: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "quote_sent",
        "customer_action_required",
        "accepted",
        "rejected",
        "ticket_created",
        "assigned",
        "in_progress",
        "completed",
        "closed",
        "cancelled",
      ],
      default: "submitted",
      index: true,
    },

    attachmentUrls: {
      type: [String],
      default: [],
    },

    adminNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>(
    "ServiceRequest",
    ServiceRequestSchema
  );

export default ServiceRequest;
