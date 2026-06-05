import express from "express";
import * as movieController from "../controllers/movieController.js";
import { allowRole } from "../middlewares/roleMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/createMovie",
  authenticate,
  allowRole("admin"),
  upload.single("posterImage"),
  movieController.createMovie,
);

router.get("/getAllMoviesUser", movieController.getAllMoviesUser);

router.get(
  "/getAllMoviesAdmin",
  authenticate,
  allowRole("admin"),
  movieController.getAllMoviesAdmin,
);

router.get("/getMovieById/:id", movieController.getMovieById);

router.get("/getTopMovieByRating", movieController.getTopMovieByRating);

router.put(
  "/updateMovie/:id",
  authenticate,
  allowRole("admin"),
  upload.single("posterImage"),
  movieController.updateMovie,
);

export default router;
