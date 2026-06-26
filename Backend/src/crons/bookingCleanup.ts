import cron from "node-cron";
import Booking from "../models/bookingModel.js";
import * as bookingService from "../services/bookingService.js";
import logger from "../utils/logger.js";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const startBookingCleanupCron = () => {
  // Runs every 1 minute ("* * * * *")
  cron.schedule("* * * * *", async () => {
    try {
      const expirationThreshold = new Date(Date.now() - FIVE_MINUTES_MS);

      // Find all pending bookings created more than 5 minutes ago
      const expiredBookings = await Booking.find({
        status: "pending",
        createdAt: { $lt: expirationThreshold },
      })
        .select("_id bookingId")
        .lean();

      if (expiredBookings.length === 0) return;

      logger.info(
        `Cron: Found ${expiredBookings.length} expired pending bookings.`,
      );

      for (const booking of expiredBookings) {
        try {
          // Reuse the existing service to handle status change AND seat unlocking
          await bookingService.updateBookingStatus(booking._id.toString(), {
            status: "failed",
          });

          logger.info(`Cron: Auto-expired booking ${booking.bookingId}`);
        } catch (error) {
          logger.error(
            `Cron: Failed to expire booking ${booking.bookingId}: ${(error as Error).message}`,
          );
        }
      }
    } catch (error) {
      logger.error(
        `Cron: Booking cleanup job failed: ${(error as Error).message}`,
      );
    }
  });
  logger.info("Booking cleanup cron job scheduled (runs every 1 minute).");
};
