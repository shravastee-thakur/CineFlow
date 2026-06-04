import Theater, { ITheater } from "../models/theaterModel.js";
import { HydratedDocument } from "mongoose";

export type TheaterDocument = HydratedDocument<ITheater>;

export type CreateTheaterData = Pick<ITheater, "name" | "location" | "city">;

export type UpdateTheaterData = Partial<CreateTheaterData>;

export const createTheater = async (
  data: CreateTheaterData,
): Promise<TheaterDocument> => {
  return Theater.create(data);
};

export const findAllTheaters = async (
  page: number = 1,
  limit: number = 10,
): Promise<TheaterDocument[]> => {
  const skip = (page - 1) * limit;
  return Theater.find({ isDeleted: { $ne: true } })
    .skip(skip)
    .limit(limit)
    .exec();
};

export const findAllTheatersAdmin = async (
  page: number = 1,
  limit: number = 10,
): Promise<TheaterDocument[]> => {
  const skip = (page - 1) * limit;
  return Theater.find()
    .skip(skip)
    .limit(limit)
    .exec();
};

export const countAllTheaters = (): Promise<number> => {
  return Theater.countDocuments({ isDeleted: { $ne: true } }).exec();
};

export const findTheaterByName = async (
  name: string,
): Promise<TheaterDocument | null> => {
  const escapeRegex = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const safeName = escapeRegex(name);
  return Theater.findOne({
    name: new RegExp(`^${safeName}$`, "i"),
    isDeleted: { $ne: true },
  }).exec();
};

export const findTheaterById = async (
  theaterId: string,
): Promise<TheaterDocument | null> => {
  return Theater.findOne({
    _id: theaterId,
    isDeleted: { $ne: true },
  }).exec();
};

// export const findTheaterByState = async (
//   state: string,
// ): Promise<TheaterDocument[]> => {
//   const escapeRegex = (text: string) =>
//     text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

//   const safeState = escapeRegex(state);
//   return Theater.find({
//     state: RegExp(`^${safeState}$`, "i"),
//     isDeleted: { $ne: true },
//   }).exec();
// };

export const findTheaterByCity = async (
  city: string,
): Promise<TheaterDocument[]> => {
  const escapeRegex = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const safeCity = escapeRegex(city);
  return Theater.find({
    city: RegExp(`^${safeCity}$`, "i"),
    isDeleted: { $ne: true },
  }).exec();
};

export const updateTheater = async (
  theaterId: string,
  theaterData: UpdateTheaterData,
): Promise<TheaterDocument | null> => {
  return Theater.findByIdAndUpdate(theaterId, theaterData, {
    new: true,
    runValidators: true,
  }).exec();
};
