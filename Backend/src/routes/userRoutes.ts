import express from "express";
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { sanitizeMiddleware } from "../middlewares/sanitize.js";
import { securityMiddleware } from "../middlewares/securityMiddleware.js";
import { rateLimiterMiddleware } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", sanitizeMiddleware, userController.register);

router.post(
  "/loginStepOne",
  securityMiddleware,
  sanitizeMiddleware,
  userController.loginStepOne,
);

router.post(
  "/verifyLogin",
  securityMiddleware,
  sanitizeMiddleware,
  rateLimiterMiddleware(5, 60),
  userController.verifyLogin,
);

router.post("/refresh", userController.refreshHandler);

router.post(
  "/forgot-password",
  sanitizeMiddleware,
  rateLimiterMiddleware(3, 60),
  userController.forgetPassword,
);

router.post(
  "/reset-password",
  sanitizeMiddleware,
  userController.resetPassword,
);
router.post("/logout", authenticate, userController.logout);

export default router;
