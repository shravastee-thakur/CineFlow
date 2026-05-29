import mongoose, { Schema, Model } from "mongoose";

export interface IBooking {
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seats: string[];
  totalPrice: number;
  bookingId: string;
  status: "pending" | "confirmed" | "cancelled" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    show: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },
    seats: {
      type: [String],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "failed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

const Booking: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  bookingSchema,
);
export default Booking;
