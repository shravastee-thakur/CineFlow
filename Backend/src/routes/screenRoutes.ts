import express from "express";
import * as screenController from "../controllers/screenController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { allowRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/createScreen",
  authenticate,
  allowRole("admin"),
  screenController.createScreen,
);

router.get("/getScreensByTheater/:id", screenController.getScreensByTheater);

router.get(
  "/getScreensByTheaterAdmin/:id",
  authenticate,
  allowRole("admin"),
  screenController.getScreensByTheaterAdmin,
);

router.get("/getScreenById/:id", screenController.getScreenById);

router.put(
  "/updateScreen/:id",
  authenticate,
  allowRole("admin"),
  screenController.updateScreen,
);

router.delete(
  "/deleteScreen/:id",
  authenticate,
  allowRole("admin"),
  screenController.deleteScreen,
);

export default router;
