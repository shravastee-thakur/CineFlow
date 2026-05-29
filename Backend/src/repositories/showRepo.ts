import Show, { IShow } from "../models/showModel.js";
import { HydratedDocument } from "mongoose";

export type ShowDocument = HydratedDocument<IShow>;

export type CreateShowData = Pick<
  IShow,
  "movie" | "screen" | "startTime" | "endTime"
>;

export type UpdateShowData = Partial<CreateShowData>;

export const createShow = async (
  data: CreateShowData,
): Promise<ShowDocument> => {
  return Show.create(data);
};

export const findShowById = async (
  showId: string,
): Promise<ShowDocument | null> => {
  return Show.findById(showId).exec();
};

export const findShowsByScreen = async (
  screenId: string,
): Promise<ShowDocument[]> => {
  return Show.find({ screen: screenId, isDeleted: { $ne: true } })
    .sort({ startTime: 1 })
    .exec();
};

export const findShowsByMovie = async (
  movieId: string,
): Promise<ShowDocument[]> => {
  return Show.find({ movie: movieId, isDeleted: { $ne: true } })
    .sort({ startTime: 1 })
    .exec();
};

export const findOverlappingShows = async (
  screenId: string,
  startTime: Date,
  endTime: Date,
  excludeShowId?: string,
): Promise<ShowDocument[]> => {
  const query: any = {
    screen: screenId,
    isDeleted: { $ne: true },
    status: { $ne: true },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeShowId) {
    query._id = { $ne: excludeShowId };
  }

  return Show.find(query).exec();
};

export const lockSeats = async (
  showId: string,
  seatsToLock: string[],
): Promise<ShowDocument | null> => {
  return Show.findOneAndUpdate(
    {
      _id: showId,
      isDeleted: { $ne: true },
      status: "scheduled",
      bookedSeats: { $nin: seatsToLock },
    },
    {
      $addToSet: { bookedSeats: { $each: seatsToLock } },
    },
    { new: true },
  ).exec();
};

export const unlockSeats = async (
  showId: string,
  seatsToRemove: string[],
): Promise<ShowDocument | null> => {
  return Show.findOneAndUpdate(
    {
      _id: showId,
      isDeleted: { $ne: true },
      status: "scheduled",
    },
    { $pullAll: { bookedSeats: seatsToRemove } },

    { new: true },
  ).exec();
};
