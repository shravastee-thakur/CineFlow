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
  id: string,
  newStatus: IBooking["status"],
): Promise<BookingDocument | null> => {
  return Booking.findByIdAndUpdate(
    id,
    { status: newStatus },
    { new: true, runValidators: true },
  ).exec();
};

export const findBookingsByUser = async (
  userId: string,
): Promise<BookingDocument[]> => {
  return Booking.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

export const findBookingByBookingId = async (
  bookingId: string,
): Promise<BookingDocument | null> => {
  return Booking.findOne({ bookingId }).exec();
};
