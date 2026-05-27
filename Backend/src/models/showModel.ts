import mongoose, { Schema, Model } from "mongoose";

export interface IShow {
  movie: mongoose.Types.ObjectId;
  screen: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  bookedSeats: string[];
  status: "scheduled" | "cancelled" | "completed";
  isDeleted: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const showSchema = new Schema<IShow>(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    screen: {
      type: Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true },
);

showSchema.index({ screen: 1, startTime: 1 });

const Show: Model<IShow> = mongoose.model<IShow>("Show", showSchema);
export default Show;
