import Payment, { IPayment } from "../models/paymentModel.js";
import { HydratedDocument } from "mongoose";

export type PaymentDocument = HydratedDocument<IPayment>;

export type CreatePaymentData = Pick<
  IPayment,
  "user" | "booking" | "stripeSessionId" | "amount" | "status"
>;

export const createPayment = async (
  data: CreatePaymentData,
): Promise<PaymentDocument> => {
  return Payment.create(data);
};

export const findPaymentBySessionId = async (
  sessionId: string,
): Promise<PaymentDocument | null> => {
  return Payment.findOne({ stripeSessionId: sessionId }).exec();
};

export const findPendingPaymentByBookingId = async (
  bookingId: string,
): Promise<PaymentDocument | null> => {
  return Payment.findOne({ booking: bookingId, status: "pending" }).exec();
};

export const updatePaymentStatusAtomic = async (
  paymentId: string,
  expectedStatus: IPayment["status"],
  newStatus: IPayment["status"],
): Promise<PaymentDocument | null> => {
  return Payment.findOneAndUpdate(
    { _id: paymentId, status: expectedStatus },
    { status: newStatus },
    { returnDocument: 'after', runValidators: true },
  ).exec();
};
