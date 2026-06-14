import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { BookingJobData } from "../config/bullmq.js";
import * as bookingService from "../services/bookingService.js";
import logger from "../utils/logger.js";

const bookingWorker = new Worker<BookingJobData, void, string>(
  "bookingQueue",
  async (job) => {
    const { bookingId } = job.data;
    await bookingService.expirePendingBooking(bookingId);
  },
  { connection: redis, concurrency: 10 },
);

bookingWorker.on("failed", (job, err) => {
  logger.error(`Booking job ${job?.id} failed: ${err.message}`);
});

export default bookingWorker;
