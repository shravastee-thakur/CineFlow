import { email } from "zod";
import { redis } from "../config/redis.js";

const OTP_TTL = 300;
const RESET_TTL = 900;

export const saveOtp = async (email: string, otp: string) => {
  await redis.set(`otp:${email}`, otp, "EX", OTP_TTL);
};

export const getOtp = async (email: string): Promise<string | null> => {
  return await redis.get(`otp:${email}`);
};

export const deleteOtp = async (email: string): Promise<number> => {
  return await redis.del(`otp:${email}`);
};

//-------x-------(forget password)-------

export const saveResetToken = async (userId: string, hashedToken: string) => {
  return await redis.set(`pwdReset:${userId}`, hashedToken, "EX", RESET_TTL);
};

export const getResetToken = async (userId: string): Promise<string | null> => {
  return await redis.get(`pwdReset:${userId}`);
};

export const deleteResetToken = async (userId: string): Promise<number> => {
  return await redis.del(`pwdReset:${userId}`);
};
