import Stripe from "stripe";
import { env } from "../config/env.js";
import * as paymentRepo from "../repositories/paymentRepo.js";
import * as bookingService from "../services/bookingService.js";
import { ApiError } from "../utils/apiError.js";
import { PaymentDocument } from "../repositories/paymentRepo.js";
import mongoose from "mongoose";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export interface PaymentDto {
  _id: string;
  user: string;
  booking: string;
  stripeSessionId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}

const mapToPaymentDto = (payment: PaymentDocument): PaymentDto => {
  const obj = payment.toObject();
  return {
    _id: obj._id.toString(),
    user: obj.user.toString(),
    booking: obj.booking.toString(),
    stripeSessionId: obj.stripeSessionId,
    amount: obj.amount,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const createPayment = async (
  userId: string,
  bookingId: string,
): Promise<{ url: string }> => {
  const booking = await bookingService.findBookingByBookingId(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new ApiError(403, "You can only pay for your own bookings");
  }

  if (booking.status !== "pending") {
    throw new ApiError(400, "This booking is no longer pending payment");
  }

  const stripeAmount = Math.round(booking.totalPrice * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Movie Ticket",
            description: `Booking ID: ${booking.bookingId}`,
          },
          unit_amount: stripeAmount,
        },
        quantity: 1,
      },
    ],

    success_url: `${env.FRONTEND_URL}/payment-success/${booking.bookingId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/payment/cancel?booking_id=${booking.bookingId}`,
  });

  await paymentRepo.createPayment({
    user: new mongoose.Types.ObjectId(userId),
    booking: new mongoose.Types.ObjectId(bookingId),
    stripeSessionId: session.id,
    amount: booking.totalPrice,
    status: "pending",
  });

  if (!session.url) {
    throw new ApiError(500, "Failed to generate Stripe checkout URL");
  }

  return { url: session.url };
};

export const verifyPayment = async (sessionId: string): Promise<PaymentDto> => {
  const payment = await paymentRepo.findPaymentBySessionId(sessionId);
  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  if (payment.status === "completed") {
    return mapToPaymentDto(payment);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid") {
    const updatePayment = await paymentRepo.updatePayment(
      payment._id.toString(),
      "completed",
    );
    if (!updatePayment) {
      throw new ApiError(500, "Failed to update payment record in database");
    }

    const confirmedBooking = await bookingService.updateBookingStatus(
      payment.booking.toString(),
      {
        status: "confirmed",
      },
    );

    if (confirmedBooking) {
      const mail = bookingService.triggerBookingConfirmationEmail(
        confirmedBooking.bookingId,
      );

      if (!mail) {
        throw new ApiError(
          400,
          `Failed to queue confirmation email for booking ${confirmedBooking.bookingId}`,
        );
      }
    }

    return mapToPaymentDto(updatePayment);
  }

  const failedPayment = await paymentRepo.updatePayment(
    payment._id.toString(),
    "failed",
  );

  if (!failedPayment) {
    throw new ApiError(500, "Failed to update payment record in database");
  }

  await bookingService.updateBookingStatus(payment.booking.toString(), {
    status: "failed",
  });

  throw new ApiError(400, "Payment was not completed");
};
