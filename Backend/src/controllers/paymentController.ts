import { Request, Response, NextFunction } from "express";
import * as paymentService from "../services/paymentService.js";
import logger from "../utils/logger.js";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { bookingId } = req.body;
    if (!bookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
    }

    const { url } = await paymentService.createPayment(userId, bookingId);
    logger.info(`Checkout session created for booking: ${bookingId}`);

    return res.status(200).json({
      success: true,
      message: "Checkout session created",
      data: { url },
    });
  } catch (error) {
    logger.error(`Error in Create Payment: ${(error as Error).message}`);
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.body.sessionId as string;
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required" });
    }

    const payment = await paymentService.verifyPayment(sessionId);
    logger.info(`Payment verified for session: ${sessionId}`);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    logger.error(`Verify Checkout error: ${(error as Error).message}`);
    next(error);
  }
};
