import { z } from "zod";

export const createTheaterSchema = z.object({
  name: z.string().min(2, "Theater name must be at least 2 characters").trim(),
  location: z
    .string()
    .min(3, "Location address must be at least 3 characters")
    .trim(),
  city: z.string().min(2, "City name must be at least 2 characters").trim(),
  // state: z.string().min(2, "State name must be at least 2 characters").trim(),
});

export const updateTheaterSchema = createTheaterSchema.partial();

export type CreateTheaterInput = z.infer<typeof createTheaterSchema>;
export type UpdateTheaterInput = z.infer<typeof updateTheaterSchema>;
