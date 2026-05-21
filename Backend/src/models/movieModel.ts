import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMovie {
  title: string;
  description: string;
  duration: number;
  genre: string[];
  releaseDate: Date;
  language: string[];
  posterImage?: {
    url: string;
    public_id: string;
  };
  rating: number;
  format: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 minute"],
    },
    genre: {
      type: [String],
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    language: {
      type: [String],
      required: true,
    },
    posterImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    rating: {
      type: Number,
      required: true,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    format: {
      type: [String],
      default: ["2D"],
    },
  },
  { timestamps: true },
);

const Movie: Model<IMovie> = mongoose.model<IMovie>("Movie", movieSchema);
export default Movie;
