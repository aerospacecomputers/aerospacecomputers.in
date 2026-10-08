import mongoose, { Schema, Model } from "mongoose";

export interface ICustomerProfile {
  userId: mongoose.Types.ObjectId;

  customerType: "business" | "individual";

  companyId?: string | null;
  companyName?: string | null;

  contactPerson: string;
  phone: string;
  email: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    customerType: {
      type: String,
      enum: ["business", "individual"],
      required: true,
      default: "individual",
    },

    companyId: {
      type: String,
      default: null,
    },

    companyName: {
      type: String,
      default: null,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const CustomerProfile: Model<ICustomerProfile> =
  mongoose.models.CustomerProfile ||
  mongoose.model<ICustomerProfile>("CustomerProfile", CustomerProfileSchema);

export default CustomerProfile;
