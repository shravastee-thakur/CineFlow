import express from "express";
import * as showController from "../controllers/showController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { allowRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/createShow",
  authenticate,
  allowRole("admin"),
  showController.createShow,
);

router.get("/getShowById/:id", showController.getShowById);

router.get("/getShowsByTheater/:id", showController.getShowsByTheater);
router.get(
  "/getShowsByTheaterAdmin/:id",
  authenticate,
  allowRole("admin"),
  showController.getShowsByTheaterAdmin,
);

router.get("/getShowsByScreen/:id", showController.getShowsByScreen);

router.get(
  "/getShowsByScreenAdmin/:id",
  authenticate,
  allowRole("admin"),
  showController.getShowsByScreenAdmin,
);

router.get("/getShowsByMovie/:id", showController.getShowsByMovie);

router.get(
  "/getShowsByMovieAdmin/:id",
  authenticate,
  allowRole("admin"),
  showController.getShowsByMovieAdmin,
);

router.put(
  "/updateShow/:id",
  authenticate,
  allowRole("admin"),
  showController.updateShow,
);

router.delete(
  "/cancelShow/:id",
  authenticate,
  allowRole("admin"),
  showController.cancelShow,
);

export default router;
