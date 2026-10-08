import mongoose, { Schema, Model } from "mongoose";

export type UserRole = "admin" | "customer" | "engineer";
export type CustomerType = "business" | "individual";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;

  role: UserRole;

  // Optional for individual/home customers
  companyId?: string | null;
  customerType?: CustomerType;

  phone?: string;
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "engineer"],
      required: true,
      default: "customer",
      index: true,
    },

    companyId: {
      type: String,
      default: null,
      index: true,
    },

    customerType: {
      type: String,
      enum: ["business", "individual"],
      default: "individual",
    },

    phone: {
      type: String,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;


