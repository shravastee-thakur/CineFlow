import mongoose, { Schema, Model } from "mongoose";

export interface ITheater {
  name: string;
  location: string;
  city: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const theaterSchema = new Schema<ITheater>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

const Theater: Model<ITheater> = mongoose.model<ITheater>(
  "Theater",
  theaterSchema,
);

export default Theater;
