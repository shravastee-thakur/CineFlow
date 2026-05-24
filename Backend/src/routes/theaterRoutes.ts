import express from "express";
import * as theaterController from "../controllers/theaterController.js";
import { allowRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/createTheater",
  authenticate,
  allowRole("admin"),
  theaterController.createTheater,
);

router.get("/getAllTheaters", theaterController.getAllTheaters);

router.get("/getTheaterById/:id", theaterController.getTheaterById);

router.get("/getTheaterByCity/:city", theaterController.getTheaterByCity);

router.put(
  "/updateTheater/:id",
  authenticate,
  allowRole("admin"),
  theaterController.updateTheater,
);

router.delete(
  "/deleteTheater/:id",
  authenticate,
  allowRole("admin"),
  theaterController.deleteTheater,
);

export default router;
