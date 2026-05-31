import { env } from "../config/env.js";
import * as userRepo from "../repositories/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import { CreateUserData, UserDocument } from "../repositories/userRepo.js";
import * as otpService from "../services/otpService.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
  verifyRefreshToken,
} from "../utils/jwt.js";
import * as queueService from "../services/queueService.js";

export interface RegisterInput extends CreateUserData {}
export interface LoginInput {
  email: string;
  password: string;
}

// Pure Data Transfer Object. No Mongoose types, no passwords, no refresh tokens.
export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cleanly map a Mongoose document to a plain object
const mapToDTO = (user: UserDocument): UserDTO => {
  const obj = user.toObject();
  return {
    _id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    isVerified: obj.isVerified,
    createdAt: obj.createdAt!,
    updatedAt: obj.updatedAt!,
  };
};

// Register
export const register = async (data: RegisterInput): Promise<UserDTO> => {
  const { name, email, password, role } = data;

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await userRepo.createUser({ name, email, password, role });

  return mapToDTO(newUser);
};

// -----x-----(login)------
// Login verify
export const loginVerifyCredentials = async (
  data: LoginInput,
): Promise<UserDTO> => {
  const { email, password } = data;
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  return mapToDTO(user);
};

// hmac hashing
const hashedOtp = (otp: string): string => {
  return crypto.createHmac("sha256", env.HMAC_SECRET).update(otp).digest("hex");
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
  otp: string,
): Promise<UserDTO> => {
  let user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const inputHash = hashedOtp(otp);

  const isValid = await otpService.consumeOtp(user.email, inputHash);

  if (!isValid) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  if (!user.isVerified) {
    const updatedUser = await userRepo.updateUser(userId, { isVerified: true });
    if (!updatedUser)
      throw new ApiError(500, "Failed to update user verification status");
    user = updatedUser;
  }

  return mapToDTO(user);
};

// -----x-----(token rotate)--------

// Access Refresh
export const createTokensAndSave = async (user: UserDTO) => {
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

  const storedBuffer = Buffer.from(user.refreshToken, "hex");
  const hashBuffer = Buffer.from(hashedRefreshToken, "hex");

  const isMatch =
    storedBuffer.length === hashBuffer.length &&
    crypto.timingSafeEqual(storedBuffer, hashBuffer);

  if (!isMatch) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const safeUser = mapToDTO(user);

  const { accessToken, refreshToken } = await createTokensAndSave(safeUser);

  return { accessToken, refreshToken, user: safeUser };
};

// ------x------(forget password)-------
export const forgetPassword = async (email: string) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  const resetToken = crypto.randomBytes(10).toString("hex");

  const hashedToken = crypto
    .createHmac("sha256", env.HMAC_SECRET)
    .update(resetToken)
    .digest("hex");

  await otpService.saveResetToken(user._id.toString(), hashedToken);

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&userId=${user._id}`;

  await queueService.sendPasswordResetEmail(email, resetLink);
};

export const resetPassword = async (
  userId: string,
  token: string,
  newPassword: string,
) => {
  const hashedToken = crypto
    .createHmac("sha256", env.HMAC_SECRET)
    .update(token)
    .digest("hex");

  // Atomically verify and consume the reset token in Redis
  const isValid = await otpService.consumeResetToken(userId, hashedToken);

  if (!isValid) {
    throw new ApiError(401, "Invalid or expired reset token");
  }

  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Assign the raw password and let the model's pre('save') hook do its job.
  user.password = newPassword;
  await user.save();
};

// ------x------(logout)-----
export const logout = async (userId: string) => {
  if (!userId) return;

  await userRepo.updateUser(userId, { refreshToken: "" });
};
