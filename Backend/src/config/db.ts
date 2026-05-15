import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

export const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("Database connected");
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};
