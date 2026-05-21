import User, { IUser, IUserMethods } from "../models/userModel.js";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export type CreateUserData = Pick<
  IUser,
  "name" | "email" | "password" | "role"
>;

export const findByEmail = (email: string): Promise<UserDocument | null> =>
  User.findOne({ email }).select("+password").exec();

export const findById = (id: string): Promise<UserDocument | null> =>
  User.findById(id);

export const createUser = (data: CreateUserData): Promise<UserDocument> =>
  User.create(data);

export const updateUser = (
  id: string,
  update: Partial<IUser>,
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(id, update, { new: true });
