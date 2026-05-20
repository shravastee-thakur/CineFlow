import { redis } from "../config/redis.js";

const OTP_TTL = 300;
const RESET_TTL = 900;

const verifyAndDelete = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end
`;

export const saveOtp = async (email: string, otp: string) => {
  await redis.set(`otp:${email}`, otp, "EX", OTP_TTL);
};

export const consumeOtp = (email: string, otp: string) =>
  redis.eval(verifyAndDelete, 1, `otp:${email}`, otp).then((res) => res === 1);

// export const getOtp = async (email: string): Promise<string | null> => {
//   return await redis.get(`otp:${email}`);
// };

// export const deleteOtp = async (email: string): Promise<number> => {
//   return await redis.del(`otp:${email}`);
// };

//-------x-------(forget password)-------

export const saveResetToken = async (userId: string, hashedToken: string) => {
  return await redis.set(`pwdReset:${userId}`, hashedToken, "EX", RESET_TTL);
};

export const consumeResetToken = (userId: string, token: string) =>
  redis
    .eval(verifyAndDelete, 1, `pwdReset:${userId}`, token)
    .then((res) => res === 1);

// export const getResetToken = async (userId: string): Promise<string | null> => {
//   return await redis.get(`pwdReset:${userId}`);
// };

// export const deleteResetToken = async (userId: string): Promise<number> => {
//   return await redis.del(`pwdReset:${userId}`);
// };
