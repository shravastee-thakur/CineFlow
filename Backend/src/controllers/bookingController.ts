import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/bookingService.js";
import logger from "../utils/logger.js";
import {
  createBookingSchema,
  CreateBookingInput,
  updateBookingStatusSchema,
  UpdateBookingStatusInput,
} from "../validators/bookingValidator.js";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const validatedData = createBookingSchema.parse(
      req.body,
    ) as CreateBookingInput;

    const booking = await bookingService.createBooking(userId, validatedData);
    logger.info(`Booking initiated: ${booking.bookingId} for user: ${userId}`);

    return res.status(201).json({
      success: true,
      message: "Seats locked. Please proceed to payment.",
      data: booking,
    });
  } catch (error) {
    logger.error(`Create Booking error: ${(error as Error).message}`);
    next(error);
  }
};

export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookingId = req.params.id as string;
    const validatedData = updateBookingStatusSchema.parse(
      req.body,
    ) as UpdateBookingStatusInput;

    const updatedBooking = await bookingService.updateBookingStatus(
      bookingId,
      validatedData,
    );
    logger.info(
      `Booking : ${bookingId} status updated to: ${validatedData.status}`,
    );

    return res.status(200).json({
      success: true,
      message: `Booking updated successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    logger.error(`Update Booking error: ${(error as Error).message}`);
    next(error);
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookingId = req.params.id as string;

    const booking = await bookingService.findBookingByBookingId(bookingId);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    logger.error(`Get Booking By Id error: ${(error as Error).message}`);
    next(error);
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await bookingService.findBookingsByUser(userId);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    logger.error(`Get My Bookings error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.findAllBookings();

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    logger.error(`Get All Bookings error: ${(error as Error).message}`);
    next(error);
  }
};
