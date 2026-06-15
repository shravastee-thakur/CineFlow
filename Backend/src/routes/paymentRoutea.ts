import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import * as paymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment", authenticate, paymentController.createPayment);
router.post("/verifyPayment", paymentController.verifyPayment);

export default router;
