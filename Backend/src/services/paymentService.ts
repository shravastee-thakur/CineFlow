import Stripe from "stripe";
import { env } from "../config/env.js";
import * as paymentRepo from "../repositories/paymentRepo.js";
import * as bookingRepo from "../repositories/bookingRepo.js";
import * as bookingService from "../services/bookingService.js";
import { ApiError } from "../utils/apiError.js";
import { PaymentDocument } from "../repositories/paymentRepo.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

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
  bookingMongoId: string,
): Promise<{ url: string }> => {
  const rawbooking = await bookingRepo.findBookingById(bookingMongoId);

  if (!rawbooking) {
    throw new ApiError(404, "Booking not found");
  }

  if (rawbooking.user._id.toString() !== userId) {
    throw new ApiError(403, "You can only pay for your own bookings");
  }

  if (rawbooking.status !== "pending") {
    throw new ApiError(400, "This booking is no longer pending payment");
  }

  // IDEMPOTENCY: Prevent duplicate Stripe sessions
  const existingPendingPayment =
    await paymentRepo.findPendingPaymentByBookingId(bookingMongoId);
  if (existingPendingPayment) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      existingPendingPayment.stripeSessionId,
    );
    if (existingSession.status === "open" && existingSession.url) {
      return { url: existingSession.url };
    }
  }

  const stripeAmount = Math.round(rawbooking.totalPrice * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Movie Ticket",
            description: `Booking ID: ${rawbooking.bookingId}`,
          },
          unit_amount: stripeAmount,
        },
        quantity: 1,
      },
    ],

    success_url: `${env.FRONTEND_URL}/payment-success/${rawbooking.bookingId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/payment/cancel?booking_id=${rawbooking.bookingId}`,
  });

  await paymentRepo.createPayment({
    user: new mongoose.Types.ObjectId(userId),
    booking: new mongoose.Types.ObjectId(bookingMongoId),
    stripeSessionId: session.id,
    amount: rawbooking.totalPrice,
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
    const currentBooking = await bookingRepo.findBookingById(
      payment.booking.toString(),
    );

    // If the booking expired and seats were released, refund the user immediately
    if (
      !currentBooking ||
      currentBooking.status === "failed" ||
      currentBooking.status === "cancelled"
    ) {
      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
        });
      }

      await paymentRepo.updatePaymentStatusAtomic(
        payment._id.toString(),
        "pending",
        "failed",
      );
      throw new ApiError(
        400,
        "Booking expired before payment completed. A full refund has been issued.",
      );
    }

    // IDEMPOTENCY: Atomic conditional update
    const updatePayment = await paymentRepo.updatePaymentStatusAtomic(
      payment._id.toString(),
      "pending",
      "completed",
    );
    if (!updatePayment) {
      const currentPayment =
        await paymentRepo.findPaymentBySessionId(sessionId);
      return mapToPaymentDto(currentPayment!);
    }

    const confirmedBooking = await bookingService.updateBookingStatus(
      payment.booking.toString(),
      {
        status: "confirmed",
      },
    );

    if (confirmedBooking) {
      bookingService
        .triggerBookingConfirmationEmail(confirmedBooking.bookingId)
        .catch((err) => {
          logger.error(`Failed to queue confirmation email: ${err.message}`);
        });
    }

    return mapToPaymentDto(updatePayment);
  }

  const failedPayment = await paymentRepo.updatePaymentStatusAtomic(
    payment._id.toString(),
    "pending",
    "failed",
  );

  if (!failedPayment) {
    const currentPayment = await paymentRepo.findPaymentBySessionId(sessionId);
    return mapToPaymentDto(currentPayment!);
  }

  await bookingService.updateBookingStatus(payment.booking.toString(), {
    status: "failed",
  });

  throw new ApiError(400, "Payment was not completed");
};
