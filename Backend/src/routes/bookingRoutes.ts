import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { allowRole } from "../middlewares/roleMiddleware.js";
import * as bookingController from "../controllers/bookingController.js";

const router = express.Router();

router.post("/createBooking", authenticate, bookingController.createBooking);

router.get(
  "/getAllBookings",
  authenticate,
  allowRole("admin"),
  bookingController.getAllBookings,
);

router.get(
  "/getBookingByCustomId/:id",
  authenticate,
  bookingController.getBookingByCustomId,
);

router.get(
  "/getBookingByMongoId/:id",
  authenticate,
  bookingController.getBookingByMongoId,
);

router.get("/getMyBookings", authenticate, bookingController.getMyBookings);

router.put(
  "/updateBookingStatus/:id",
  authenticate,
  allowRole("admin"),
  bookingController.updateBookingStatus,
);

export default router;
