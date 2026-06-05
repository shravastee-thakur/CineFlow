import Screen, { IScreen } from "../models/screenModel.js";
import { HydratedDocument } from "mongoose";

export type ScreenDocument = HydratedDocument<IScreen>;

export type CreateScreenData = Pick<
  IScreen,
  "theater" | "name" | "format" | "audioType" | "layout"
>;

export type UpdateScreenData = Partial<CreateScreenData>;

export const createScreen = async (
  data: CreateScreenData,
): Promise<ScreenDocument> => {
  return Screen.create(data);
};

export const findScreenById = async (
  screenId: string,
): Promise<ScreenDocument | null> => {
  return Screen.findOne({ _id: screenId, isDeleted: { $ne: true } }).exec();
};

export const findScreensByTheater = async (
  theaterId: string,
  includeDeleted: boolean = false,
): Promise<ScreenDocument[]> => {
  const query = Screen.find({ theater: theaterId });

  if (includeDeleted) {
    query.select("+isDeleted");
  } else {
    query.where({ isDeleted: { $ne: true } });
  }

  return query.exec();
};

export const findScreenByNameInTheater = async (
  theaterId: string,
  name: string,
): Promise<ScreenDocument | null> => {
  const escapeRegex = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const safeName = escapeRegex(name);

  return Screen.findOne({
    theater: theaterId,
    name: new RegExp(`^${safeName}$`, "i"),
    isDeleted: { $ne: true },
  }).exec();
};

export const softDeleteScreensByTheater = async (
  theaterId: string,
): Promise<{ modifiedCount: number }> => {
  const result = await Screen.updateMany(
    { theater: theaterId, isDeleted: false },
    { $set: { isDeleted: true } },
  );
  return { modifiedCount: result.modifiedCount };
};
