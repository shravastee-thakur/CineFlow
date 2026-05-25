import Screen, { IScreen } from "../models/screenModel.js";
import { HydratedDocument } from "mongoose";

export type ScreeDocument = HydratedDocument<IScreen>;

export type CreateScreenData = Pick<
  IScreen,
  "theater" | "name" | "format" | "audioType" | "layout"
>;

export type UpdateScreenData = Partial<CreateScreenData>;

export const createScreen = async (
  data: CreateScreenData,
): Promise<ScreeDocument> => {
  return Screen.create(data);
};

export const findScreenById = async (
  screenId: string,
): Promise<ScreeDocument | null> => {
  return Screen.findById(screenId).exec();
};

export const findScreensByTheater = async (
  theaterId: string,
): Promise<ScreeDocument[]> => {
  return await Screen.find({
    theater: theaterId,
    isDeleted: { $ne: true },
  }).exec();
};

export const findScreenByNameInTheater = async (
  theaterId: string,
  name: string,
): Promise<ScreeDocument | null> => {
  const escapeRegex = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const safeName = escapeRegex(name);

  return Screen.findOne({
    theater: theaterId,
    name: new RegExp(`^${safeName}$`, "i"),
    isDeleted: { $ne: true },
  }).exec();
};
