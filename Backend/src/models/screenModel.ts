import mongoose, { Schema, Model } from "mongoose";

export interface ISeat {
  seatNumber: string;
  seatType: "standard" | "premium" | "recliner";
  price: number;
  isBroken: boolean;
}

export interface IRow {
  rowName: string;
  seats: ISeat[];
}

export interface IScreen {
  theater: mongoose.Types.ObjectId;
  name: string;
  format: "2D" | "3D" | "IMAX" | "4DX";
  audioType: "Standard" | "7.1 Surround" | "Dolby Atmos";
  layout: IRow[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const seatSchema = new Schema<ISeat>(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    seatType: {
      type: String,
      enum: ["standard", "premium", "recliner", "empty"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    isBroken: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }, // Prevents Mongoose from generating useless unique IDs for every single chair
);

const rowSchema = new Schema<IRow>(
  {
    rowName: {
      type: String,
      required: true,
    },
    seats: {
      type: [seatSchema],
      required: true,
    },
  },
  { _id: false },
);

const screenSchema = new Schema<IScreen>(
  {
    theater: {
      type: Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      enum: ["2D", "3D", "IMAX", "4DX"],
      required: true,
    },
    audioType: {
      type: String,
      enum: ["Standard", "7.1 Surround", "Dolby Atmos"],
      required: true,
    },
    layout: {
      type: [rowSchema],
      required: true,
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

const Screen: Model<IScreen> = mongoose.model<IScreen>("Screen", screenSchema);
export default Screen;
