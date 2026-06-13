import * as bookingRepo from "../repositories/bookingRepo.js";
import * as showRepo from "../repositories/showRepo.js";
import * as screenRepo from "../repositories/screenRepo.js";
import * as queueService from "../services/queueService.js";
import {
  BookingDocument,
  CreateBookingData,
} from "../repositories/bookingRepo.js";
import { ApiError } from "../utils/apiError.js";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
} from "../validators/bookingValidator.js";

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
  const obj = booking.toObject ? booking.toObject() : booking;

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

export interface TicketDto {
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  seats: string[];
  totalPrice: number;
  status: string;
  showTime: Date;
  movieTitle: string;
  moviePoster: string;
  screenName: string;
  theaterName: string;
}

const mapToTicketDto = (booking: any): TicketDto => ({
  bookingId: booking.bookingId,
  userId: booking.user?._id?.toString() || booking.user?.toString() || "",
  userName: booking.user?.name || "Guest",
  userEmail: booking.user?.email || "",
  seats: booking.seats,
  totalPrice: booking.totalPrice,
  status: booking.status,
  showTime: booking.show.startTime,
  movieTitle: booking.show.movie.title,
  moviePoster: booking.show.movie.posterImage?.url || "",
  screenName: booking.show.screen.name,
  theaterName: booking.show.screen.theater.name,
});

export interface PaginatedBookingResponse {
  bookings: TicketDto[] | BookingDto[];
  currentPage: number;
  totalPages: number;
  totalBookings: number;
}

export const createBooking = async (
  userId: string,
  bookingData: CreateBookingInput,
): Promise<BookingDto> => {
  //  Lock the seats atomically in the database
  const show = await showRepo.lockSeats(bookingData.showId, bookingData.seats);
  if (!show) {
    throw new ApiError(409, "One or more selected seats are already taken.");
  }

  const now = new Date();
  const startTime = new Date(show.startTime);
  const endTime = new Date(show.endTime);

  // Fetch the screen to calculate the secure total price
  const screen = await screenRepo.findScreenById(show.screen.toString());
  if (!screen) {
    throw new ApiError(404, "Screen layout not found for price calculation.");
  }

  let calculatedPrice = 0;

  for (const requestedSeat of bookingData.seats) {
    let seatFound = false;

    for (const row of screen.layout) {
      const seat = row.seats.find((s) => s.seatNumber === requestedSeat);
      if (seat) {
        if (seat.isBroken) {
          throw new ApiError(
            400,
            `Seat ${requestedSeat} is currently out of service.`,
          );
        }

        calculatedPrice += seat.price;
        seatFound = true;
        break;
      }
    }

    if (!seatFound) {
      throw new ApiError(
        400,
        `Seat ${requestedSeat} does not exist in this screen.`,
      );
    }
  }

  //  Generate the human readable ticket ID
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
  const generatedBookingId = `BMS-${nanoid()}`;

  const finalPayload: CreateBookingData = {
    user: new mongoose.Types.ObjectId(userId),
    show: new mongoose.Types.ObjectId(bookingData.showId),
    seats: bookingData.seats,
    totalPrice: calculatedPrice,
    bookingId: generatedBookingId,
    status: "pending",
  };

  const booking = await bookingRepo.createBooking(finalPayload);

  return mapToBookingDto(booking);
};

export const updateBookingStatus = async (
  bookingId: string,
  status: UpdateBookingStatusInput,
): Promise<BookingDto | null> => {
  const updateStatus = await bookingRepo.updateBookingStatus(
    bookingId,
    status.status,
  );
  if (!updateStatus) {
    throw new ApiError(404, "Booking not found");
  }

  if (status.status === "failed" || status.status === "cancelled") {
    await showRepo.unlockSeats(
      updateStatus.show.toString(),
      updateStatus.seats,
    );
  }

  return mapToBookingDto(updateStatus);
};

export const findBookingsByUser = async (
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedBookingResponse> => {
  const totalBookings = await bookingRepo.countBookingsUser(userId);

  const bookings = await bookingRepo.findBookingsByUser(userId, page, limit);
  if (!bookings) {
    throw new ApiError(404, "Bookings not found");
  }
  const totalPages = Math.ceil(totalBookings / limit);

  return {
    bookings: bookings.map(mapToTicketDto),
    totalPages,
    currentPage: page,
    totalBookings,
  };
};

export const findBookingByBookingId = async (
  customBookingId: string,
): Promise<TicketDto | null> => {
  const booking = await bookingRepo.findBookingByBookingId(customBookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return mapToTicketDto(booking);
};

export const findBookingById = async (
  mongoId: string,
): Promise<TicketDto | null> => {
  const booking = await bookingRepo.findBookingById(mongoId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return mapToTicketDto(booking);
};

export const findAllBookings = async (
  page: number,
  limit: number,
): Promise<PaginatedBookingResponse> => {
  const totalBookings = await bookingRepo.countAllBookings();
  const bookings = await bookingRepo.findAllBookings(page, limit);
  if (!bookings) {
    throw new ApiError(404, "Bookings not found");
  }
  const totalPages = Math.ceil(totalBookings / limit);

  return {
    bookings: bookings.map(mapToBookingDto),
    totalPages,
    currentPage: page,
    totalBookings,
  };
};

export const triggerBookingConfirmationEmail = async (
  customBookingId: string,
) => {
  const rawBooking = await bookingRepo.findBookingByBookingId(customBookingId);
  if (!rawBooking) return;

  const formattedTime = new Date(rawBooking.show.startTime).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );

  await queueService.sendBookingConfirmationEmail(
    rawBooking.user.email,
    rawBooking.bookingId,
    rawBooking.show.movie.title,
    formattedTime,
    rawBooking.seats,
    rawBooking.show.screen.theater.name,
  );
};
