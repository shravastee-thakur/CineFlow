import Show, { IShow } from "../models/showModel.js";
import { HydratedDocument } from "mongoose";

export type ShowDocument = HydratedDocument<IShow>;

export type CreateShowData = Pick<
  IShow,
  "movie" | "theater" | "screen" | "startTime" | "endTime"
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
  return Show.findById(showId)
    .populate({ path: "screen", select: "layout" })
    .exec();
};

export const findShowsByTheater = async (
  theaterId: string,
  includeDeleted: boolean = false,
): Promise<ShowDocument[]> => {
  const query = Show.find({ theater: theaterId });
  if (includeDeleted) {
    query.select("+isDeleted");
  } else {
    query.where({ isDeleted: { $ne: true } });
  }
  return query.sort({ startTime: 1 }).exec();
};

export const findShowsByScreen = async (
  screenId: string,
  includeDeleted: boolean = false,
): Promise<ShowDocument[]> => {
  const query = Show.find({ screen: screenId });

  if (includeDeleted) {
    query.select("+isDeleted");
  } else {
    query.where({ isDeleted: { $ne: true } });
  }

  return query.sort({ startTime: 1 }).exec();
};

export const findShowsByMovie = async (
  movieId: string,
  includeDeleted: boolean = false,
): Promise<ShowDocument[]> => {
  const query = Show.find({ movie: movieId });
  if (includeDeleted) {
    query.select("+isDeleted");
  } else {
    query.where({ isDeleted: { $ne: true } });
  }

  return query.sort({ startTime: 1 }).exec();
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
    status: { $ne: "cancelled" },
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
