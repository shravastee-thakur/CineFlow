import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

export const connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL environment variable is not set");
    }

    await mongoose.connect(mongoUrl);
    console.log("Database connected");
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};
