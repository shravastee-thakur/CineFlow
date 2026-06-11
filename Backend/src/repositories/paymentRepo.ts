import Payment, { IPayment } from "../models/paymentModel.js";
import { HydratedDocument } from "mongoose";

export type PaymentDocument = HydratedDocument<IPayment>;

export type CreatePaymentData = Pick<
  IPayment,
  "user" | "booking" | "stripeSessionId" | "amount" | "status"
>;

export type UpdatePaymentData = Partial<CreatePaymentData>;
