import * as userRepo from "../repositories/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import { IUser } from "../models/userModel.js";
import { CreateUserData } from "../repositories/userRepo.js";
import * as otpService from "../services/otpService.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
  verifyRefreshToken,
} from "../utils/jwt.js";
import sendMail from "../config/sendMail.js";

export interface RegisterInput extends CreateUserData {}
export interface LoginInput {
  email: string;
  password: string;
}

// Defining a return type that explicitly omits sensitive data
export type UserResponse = Omit<IUser, "password" | "comparePassword">;

const OTP_SECRET = process.env.HMAC_SECRET;
if (!OTP_SECRET) {
  throw new ApiError(401, "OTP_SECRET environment variable is not defined");
}

// hmac hashing
const hashedOtp = (otp: string): string => {
  return crypto.createHmac("sha256", OTP_SECRET).update(otp).digest("hex");
};

// Register
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

// -----x-----(login)------
// Login verify
export const loginVerifyCredentials = async (
  data: LoginInput,
): Promise<UserResponse> => {
  const { email, password } = data;
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const userObject = user.toObject();
  delete userObject.password;

  return userObject as UserResponse;
};

// Otp save
export const processLoginOtp = async (userEmail: string) => {
  const otp = String(crypto.randomInt(100000, 999999));
  await otpService.saveOtp(userEmail, hashedOtp(otp));
  return otp;
};

// Verify Otp
export const verifyUserOtp = async (
  userId: string,
  userInputOtp: string,
): Promise<UserResponse> => {
  let user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const storedHash = await otpService.getOtp(user.email);

  if (!storedHash || storedHash !== hashedOtp(userInputOtp)) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  await otpService.deleteOtp(user.email);

  if (!user.isVerified) {
    const updatedUser = await userRepo.updateUser(userId, { isVerified: true });
    if (!updatedUser)
      throw new ApiError(500, "Failed to update user verification status");
    user = updatedUser;
  }

  const userObject = user.toObject();
  delete userObject.password;

  return userObject as UserResponse;
};

// -----x-----(token rotate)--------

// Access Refresh
export const createTokensAndSave = async (user: UserResponse) => {
  // 1. Explicitly convert _id to string for the JWT payload because In Mongoose, user._id is typically a complex ObjectId object, not a primitive string
  const tokenPayload = {
    id: user._id.toString(),
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await userRepo.updateUser(user._id.toString(), {
    refreshToken: hashedRefreshToken,
  });
  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string) => {
  let decoded: TokenPayload;
  try {
    decoded = verifyRefreshToken(oldToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await userRepo.findById(decoded.id);
  if (!user) throw new ApiError(404, "User not found");

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(oldToken)
    .digest("hex");

  if (!user.refreshToken || user.refreshToken !== hashedRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const userObject = user.toObject();
  delete userObject.password;
  const safeUser = userObject as UserResponse;

  const { accessToken, refreshToken } = await createTokensAndSave(safeUser);

  return { accessToken, refreshToken, user: safeUser };
};

// ------x------(forget password)-------
export const forgetPassword = async (email: string) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = crypto.randomBytes(10).toString("hex");

  const hmacSecret = process.env.HMAC_SECRET;
  if (!hmacSecret)
    throw new ApiError(401, "hmacSecret environment variable is not defined");

  const hashedToken = crypto
    .createHmac("sha256", hmacSecret)
    .update(resetToken)
    .digest("hex");

  await otpService.saveResetToken(user._id.toString(), hashedToken);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userId=${user._id}`;

  const htmlContent = `
        <h2>Password Reset</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${resetLink}" style="padding:10px 15px;background:#4f46e5;color:#fff;   border-radius:4px;text-decoration:none;">
      Verify Email
        </a>
        <p>This link will expire in 5 minutes.</p>
      `;

  await sendMail(email, "Password Reset Request", htmlContent);
};

// ------x------(logout)-----
export const logout = async (refreshToken: string) => {
  if (!refreshToken) return;

  const decoded = verifyRefreshToken(refreshToken);
  if (decoded?.id) {
    await userRepo.updateUser(decoded.id, { refreshToken: "" });
  }
};
