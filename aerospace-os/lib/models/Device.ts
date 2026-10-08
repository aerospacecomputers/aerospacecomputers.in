import mongoose, { Schema, Model } from "mongoose";

export type DeviceType =
  | "laptop"
  | "desktop"
  | "server"
  | "printer"
  | "router"
  | "switch"
  | "cctv"
  | "nvr"
  | "dvr"
  | "ups"
  | "other";

export interface IDevice {
  customerId: mongoose.Types.ObjectId;

  name: string;
  deviceType: DeviceType;

  brand?: string;
  model?: string;
  serialNumber?: string;

  location?: string;

  amcCovered: boolean;
  amcExpiryDate?: Date | null;

  notes?: string;

  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    deviceType: {
      type: String,
      enum: [
        "laptop",
        "desktop",
        "server",
        "printer",
        "router",
        "switch",
        "cctv",
        "nvr",
        "dvr",
        "ups",
        "other",
      ],
      required: true,
    },

    brand: {
      type: String,
      default: "",
    },

    model: {
      type: String,
      default: "",
    },

    serialNumber: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    amcCovered: {
      type: Boolean,
      default: false,
    },

    amcExpiryDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Device: Model<IDevice> =
  mongoose.models.Device ||
  mongoose.model<IDevice>("Device", DeviceSchema);

export default Device;
