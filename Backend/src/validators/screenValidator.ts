import { z } from "zod";

const seatSchema = z.object({
  seatNumber: z.string().min(1, "Seat number is required"),
  type: z.enum(["standard", "premium", "recliner"]),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  isBroken: z.boolean().default(false),
});

const rowSchema = z.object({
  rowName: z.string().min(1, "Row name is required"),
  seats: z.array(seatSchema).min(1, "A row must have at least one seat"),
});

export const createScreenSchema = z.object({
  theater: z.string().min(1, "Theater ID is required"),
  name: z.string().min(1, "Screen name is required").trim(),
  format: z.enum(["2D", "3D", "IMAX", "4DX"]),
  audioType: z.enum(["Standard", "7.1 Surround", "Dolby Atmos"]),
  layout: z.array(rowSchema).min(1, "Screen must have at least one row"),
});

export const updateScreenSchema = createScreenSchema.partial();

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type UpdateScreenInput = z.infer<typeof updateScreenSchema>;
