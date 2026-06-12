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

export const updatePayment = async (
  paymentId: string,
  status: IPayment["status"],
): Promise<PaymentDocument | null> => {
  return Payment.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true, runValidators: true },
  ).exec();
};
