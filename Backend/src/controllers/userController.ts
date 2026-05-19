import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";
import logger from "../utils/logger.js";
import { RegisterInput, LoginInput } from "../services/userService.js";
import sendMail from "../config/sendMail.js";
import { ApiError } from "../utils/apiError.js";
import { sendAuthResponse } from "../helper/sendAuthResponse.js";
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  VerifyOtpInput,
  forgetPasswordSchema,
  ForgetPasswordInput,
  resetPasswordSchema,
  ResetPasswordInput,
} from "../validators/authValidator.js";

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await userService.register(validatedData as RegisterInput);

    logger.info(`New user registered: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    logger.error(`Register error: ${(error as Error).message}`);
    next(error);
  }
};

export const loginStepOne = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await userService.loginVerifyCredentials(
      validatedData as LoginInput,
    );

    const otp = await userService.processLoginOtp(user.email);

    const htmlContent = `
            <p>Login Verification</p>
            <p>Your OTP for login is:</p>
            <h2><strong>${otp}</strong></h2>
            <p>This OTP will expire in 5 minutes.</p>
          `;

    await sendMail(user.email, "Your 2FA Login OTP", htmlContent);

    logger.info(`OTP sent to ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Otp sent successfully",
      user: user._id,
    });
  } catch (error) {
    logger.warn(`Failed login attempt for: ${req.body?.email}`);
    logger.error(`Login step 1 error: ${(error as Error).message}`);
    next(error);
  }
};

export const verifyLogin = async (
  req: Request<{}, {}, VerifyOtpInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);

    const { userId, otp } = validatedData;
    if (!userId || !otp) {
      logger.warn("Missing userId or OTP in verifyOtp");
      throw new ApiError(400, "Missing userId or otp");
    }

    const user = await userService.verifyUserOtp(userId, otp);

    const token = await userService.createTokensAndSave(user);
    logger.info(`OTP verified. Login success for ${user.email}`);

    return sendAuthResponse(res, token, user, "Logged in successfully");
  } catch (error) {
    logger.error(`OTP verification error: ${(error as Error).message}`);
    next(error);
  }
};

export const refreshHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldToken = req.cookies?.refreshToken;
    if (!oldToken) throw new ApiError(401, "Refresh token missing");

    const { accessToken, refreshToken, user } =
      await userService.rotateRefreshToken(oldToken);

    return sendAuthResponse(
      res,
      { accessToken, refreshToken },
      user,
      "Token refreshed",
    );
  } catch (error) {
    logger.error(`Refresh token error: ${(error as Error).message}`);
    next(error);
  }
};

export const forgetPassword = async (
  req: Request<{}, {}, ForgetPasswordInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = forgetPasswordSchema.parse(req.body);
    const { email } = validatedData;
    await userService.forgetPassword(email);
    logger.info(`Password reset link sent to ${email}`);

    return res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    logger.error(`Forgot password error: ${(error as Error).message}`);
    next(error);
  }
};

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const { userId, token, newPassword } = validatedData;
    if (!userId || !token || !newPassword)
      throw new ApiError(400, "Missing required fields");
    await userService.resetPassword(userId, token, newPassword);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logger.error(`Reset password error: ${(error as Error).message}`);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    await userService.logout(userId);

    return res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error(`Logout error: ${(error as Error).message}`);
    next(error);
  }
};
