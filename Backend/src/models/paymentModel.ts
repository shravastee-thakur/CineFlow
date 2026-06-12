import mongoose, { Schema, Model } from "mongoose";

export interface IPayment {
  user: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  stripeSessionId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema,
);
export default Payment;
