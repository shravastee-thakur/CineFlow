import Booking, { IBooking } from "../models/bookingModel.js";
import { HydratedDocument } from "mongoose";

export type BookingDocument = HydratedDocument<IBooking>;

export type CreateBookingData = Pick<
  IBooking,
  "user" | "show" | "seats" | "totalPrice" | "bookingId" | "status"
>;

const bookingPopulateOptions = [
  { path: "user", select: "name email" },
  {
    path: "show",
    select: "startTime movie screen", // Fixed: changed "show" to "screen"
    populate: [
      { path: "movie", select: "title posterImage duration" },
      {
        path: "screen",
        select: "name format audioType theater",
        populate: [{ path: "theater", select: "name city" }],
      },
    ],
  },
];

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

export const findBookingsByUser = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<any[]> => {
  const skip = (page - 1) * limit;
  return Booking.find({
    user: userId,
    status: { $in: ["cancelled", "confirmed"] },
  })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate(bookingPopulateOptions)
    .lean()
    .exec();
};

export const countBookingsUser = (userId: string): Promise<number> => {
  return Booking.countDocuments({
    user: userId,
    status: { $in: ["cancelled", "confirmed"] },
  }).exec();
};

export const findBookingByBookingId = async (
  bookingId: string,
): Promise<any | null> => {
  return Booking.findOne({ bookingId })
    .populate(bookingPopulateOptions)
    .lean()
    .exec();
};

export const findBookingById = async (
  bookingId: string,
): Promise<any | null> => {
  return Booking.findById(bookingId)
    .populate(bookingPopulateOptions)
    .lean()
    .exec();
};

export const findAllBookings = async (
  page: number = 1,
  limit: number = 10,
): Promise<any[]> => {
  const skip = (page - 1) * limit;

  return Booking.find({ status: "confirmed" })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate(bookingPopulateOptions)
    .lean()
    .exec();
};

export const countAllBookings = (): Promise<number> => {
  return Booking.countDocuments({ status: "confirmed" }).exec();
};
