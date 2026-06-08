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
  includeDeleted: boolean = false,
): Promise<TheaterDocument[]> => {
  const skip = (page - 1) * limit;

  const query = Theater.find();

  if (includeDeleted) {
    query.select("+isDeleted");
  } else {
    query.where({ isDeleted: { $ne: true } });
  }

  return query.skip(skip).limit(limit).exec();
};

export const countTheaters = async (
  includeDeleted: boolean = false,
): Promise<number> => {
  if (includeDeleted) {
    return Theater.countDocuments({}).exec();
  }
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

export const restoreTheater = async (
  theaterId: string,
): Promise<TheaterDocument | null> => {
  return Theater.findByIdAndUpdate(
    theaterId,
    { isDeleted: false },
    { new: true, runValidators: true },
  ).exec();
};

export const findAllCities = async (): Promise<{ name: string }[]> => {
  return await Theater.aggregate([
    { $match: { city: { $exists: true, $ne: "" } } },
    { $group: { _id: "$city" } },
    { $sort: { _id: 1 } }, // Alphabetical order
    { $project: { _id: 0, name: "$_id" } },
  ]);
};
