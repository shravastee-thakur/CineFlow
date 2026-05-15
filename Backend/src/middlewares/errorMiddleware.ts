import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, any>;
  name: string;
  path?: string;
  value?: any;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError (Invalid MongoDB ID)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Duplicate key error
  if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    message = `Duplicate field value entered: ${Object.keys(err.keyValue)}`;
  }

  // Validation error (Mongoose validation)
  if (err instanceof mongoose.Error.ValidationError && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
