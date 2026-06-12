import { populate } from "dotenv";
import Booking, { IBooking } from "../models/bookingModel.js";
import { HydratedDocument } from "mongoose";

export type BookingDocument = HydratedDocument<IBooking>;

export type CreateBookingData = Pick<
  IBooking,
  "user" | "show" | "seats" | "totalPrice" | "bookingId" | "status"
>;

export const createBooking = async (
  data: CreateBookingData,
): Promise<BookingDocument> => {
  return Booking.create(data);
};

export const updateBookingStatus = async (
  bookingId: string,
  newStatus: IBooking["status"],
): Promise<BookingDocument | null> => {
  return Booking.findByIdAndUpdate(
    bookingId,
    { status: newStatus },
    { new: true, runValidators: true },
  ).exec();
};

export const findBookingsByUser = async (userId: string): Promise<any[]> => {
  return Booking.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate({
      path: "show",
      select: "startTime movie show",
      populate: [
        { path: "movie", select: "title posterImage duration" },
        {
          path: "screen",
          select: "name format audioType theater",

          populate: [{ path: "theater", select: "name city" }],
        },
      ],
    })
    .lean()
    .exec();
};

export const findBookingByBookingId = async (
  bookingId: string,
): Promise<any | null> => {
  return Booking.findOne({ bookingId })
    .populate("user", "name email")
    .populate({
      path: "show",
      select: "startTime movie show",
      populate: [
        { path: "movie", select: "title posterImage duration" },
        {
          path: "screen",
          select: "name format audioType theater",

          populate: [{ path: "theater", select: "name city" }],
        },
      ],
    })
    .lean()
    .exec();
};

export const findAllBookings = async (): Promise<BookingDocument[]> => {
  return Booking.find().exec();
};
