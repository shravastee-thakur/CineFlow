import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute"),
  genre: z.union([
    z.string().transform((val) => [val]),
    z.array(z.string()).min(1, "At least one genre is required"),
  ]),
  releaseDate: z.coerce.date({
    message: "Invalid release date format",
  }),
  language: z.union([
    z.string().transform((val) => [val]),
    z.array(z.string()).min(1, "At least one language is required"),
  ]),
  rating: z.coerce.number().min(0).max(10),
  format: z.union([
    z.string().transform((val) => [val]),
    z.array(z.string()).default(["2D"]),
  ]),
  status: z
    .enum(["coming_soon", "now_showing", "ended"])
    .default("coming_soon"),
});

// The update schema makes everything optional, including the new status field
export const updateMovieSchema = createMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
