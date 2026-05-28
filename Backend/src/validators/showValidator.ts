import mongoose from "mongoose";
import { z } from "zod";

const objectIdString = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
  });

export const createShowSchema = z.object({
  movie: objectIdString,
  screen: objectIdString,
  startTime: z.coerce.date().refine((date) => date > new Date(), {
    message: "Start time must be in the future",
  }),
});

// Admins might need to reschedule a show or move it to a different screen
export const updateShowSchema = createShowSchema.partial();

export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;
