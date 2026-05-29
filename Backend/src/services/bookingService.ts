import * as bookingRepo from "../repositories/bookingRepo.js";
import * as showRepo from "../repositories/showRepo.js";
import {
  BookingDocument,
  CreateBookingData,
} from "../repositories/bookingRepo.js";
import { ApiError } from "../utils/apiError.js";
import { customAlphabet } from "nanoid";

export interface BookingDto {
  _id: string;
  user: string;
  show: string;
  seats: string[];
  totalPrice: number;
  bookingId: string;
  status: "pending" | "confirmed" | "cancelled" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const mapToBookingDto = (booking: BookingDocument): BookingDto => {
  const obj = booking.toObject();

  return {
    _id: obj._id.toString(),
    user: obj.user.toString(),
    show: obj.show.toString(),
    seats: obj.seats,
    totalPrice: obj.totalPrice,
    bookingId: obj.bookingId,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const createBooking = async (
  showId: string,
  bookingData: Omit<CreateBookingData, "bookingId" | "status">,
): Promise<BookingDto> => {
  const show = await showRepo.lockSeats(showId, bookingData.seats);
  if (!show) {
    throw new ApiError(409, "Seats are already taken.");
  }

  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
  const generatedBookingId = `BMS-${nanoid()}`;

  const finalPayload: CreateBookingData = {
    ...bookingData,
    bookingId: generatedBookingId,
    status: "pending",
  };

  const booking = await bookingRepo.createBooking(finalPayload);

  return mapToBookingDto(booking);
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "confirmed" | "failed",
): Promise<BookingDto | null> => {
  const updateStatus = await bookingRepo.updateBookingStatus(bookingId, status);
  if (!updateStatus) {
    throw new ApiError(404, "Booking not found");
  }

  if (status === "failed") {
    await showRepo.unlockSeats(
      updateStatus.show.toString(),
      updateStatus.seats,
    );
  }

  return mapToBookingDto(updateStatus);
};
