import { z } from "zod";
import mongoose from "mongoose";

// Reusable validator for MongoDB ObjectIds
const objectIdString = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
  });

const seatSchema = z.object({
  seatNumber: z.string().min(1, "Seat number is required"),
  seatType: z.enum(["standard", "premium", "recliner", "empty"]),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  isBroken: z.boolean().default(false),
});

const rowSchema = z.object({
  rowName: z.string().min(1, "Row name is required"),
  seats: z.array(seatSchema).min(1, "A row must have at least one seat"),
});

export const createScreenSchema = z.object({
  // Use the custom ObjectId validator here
  theater: objectIdString,
  name: z.string().min(1, "Screen name is required").trim(),
  format: z.enum(["2D", "3D", "IMAX", "4DX"]),
  audioType: z.enum(["Standard", "7.1 Surround", "Dolby Atmos"]),
  layout: z.array(rowSchema).min(1, "Screen must have at least one row"),
});

export const updateScreenSchema = createScreenSchema.partial();

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
