import { z } from "zod";
import mongoose from "mongoose";

const objectIdString = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
  });

export const createBookingSchema = z.object({
  showId: objectIdString,
  seats: z
    .array(z.string().min(1, "Seat identifier cannot be empty"))
    .min(1, "You must select at least one seat")
    .max(10, "You cannot book more than 10 seats in a single transaction"),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["confirmed", "failed", "cancelled"]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
