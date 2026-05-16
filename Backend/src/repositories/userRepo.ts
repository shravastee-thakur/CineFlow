import User, { IUser } from "../models/userModel.js";

export type CreateUserData = Pick<
  IUser,
  "name" | "email" | "password" | "role"
>;

export const findByEmail = (email: string): Promise<IUser | null> =>
  User.findOne({ email }).select("+password");

export const findById = (id: string): Promise<IUser | null> =>
  User.findById(id);

export const createUser = (data: CreateUserData): Promise<IUser> =>
  User.create(data);

export const updateUser = (
  id: string,
  update: Partial<IUser>,
): Promise<IUser | null> => User.findByIdAndUpdate(id, update, { new: true });
