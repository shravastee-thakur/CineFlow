import * as userRepo from "../repositories/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import { IUser } from "../models/userModel.js";
import { CreateUserData } from "../repositories/userRepo.js";

interface RegisterInput extends CreateUserData {}

// Defining a return type that explicitly omits sensitive data
export type UserResponse = Omit<IUser, "password" | "comparePassword">;

export const register = async (data: RegisterInput): Promise<UserResponse> => {
  const { name, email, password, role = "user" } = data;

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await userRepo.createUser({ name, email, password, role });

  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject as UserResponse;
};


