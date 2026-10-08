
import mongoose, { Schema, Model } from "mongoose";

export type OfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "change_requested"
  | "expired";

export interface IServiceOffer {
  serviceRequestId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;

  proposedDate: Date;
  proposedTime: string;

  labourCharges: number;
  installationMaterial: number;
  travelCharges: number;
  otherCharges: number;

  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  totalAmount: number;

  notes?: string;

  status: OfferStatus;

  customerResponse?: string | null;
  customerRespondedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const ServiceOfferSchema = new Schema<IServiceOffer>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    proposedDate: {
      type: Date,
      required: true,
    },

    proposedTime: {
      type: String,
      required: true,
    },

    labourCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    installationMaterial: {
      type: Number,
      default: 0,
      min: 0,
    },

    travelCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    gstPercentage: {
      type: Number,
      default: 18,
      min: 0,
    },

    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "change_requested",
        "expired",
      ],
      default: "draft",
      index: true,
    },

    customerResponse: {
      type: String,
      default: null,
    },

    customerRespondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceOffer: Model<IServiceOffer> =
  mongoose.models.ServiceOffer ||
  mongoose.model<IServiceOffer>("ServiceOffer", ServiceOfferSchema);

export default ServiceOffer;
