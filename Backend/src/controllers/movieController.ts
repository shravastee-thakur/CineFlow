import { Request, Response, NextFunction } from "express";
import * as movieService from "../services/movieService.js";
import logger from "../utils/logger.js";
import {
  createMovieSchema,
  CreateMovieInput,
  updateMovieSchema,
  UpdateMovieInput,
} from "../validators/movieValidator.js";
import { ApiError } from "../utils/apiError.js";

export const createMovie = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Movie poster image is required");
    }

    const validatedData = createMovieSchema.parse(req.body) as CreateMovieInput;
    const fileBuffer = req.file?.buffer;

    const movie = await movieService.createMovie(validatedData, fileBuffer);
    logger.info(`Movie created successfully : ${movie.title}`);

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      data: movie,
    });
  } catch (error) {
    logger.error(`Create Movie error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllMoviesUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawPage = parseInt(req.query.page as string, 10);
    const rawLimit = parseInt(req.query.limit as string, 10);
    // We count using 10 digits (0, 1, 2, 3, 4, 5, 6, 7, 8, 9). This is called Base-10.

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

    const movies = await movieService.findAllMoviesUser(page, limit);
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    logger.error(`Get all Movies User error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllMoviesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawPage = parseInt(req.query.page as string, 10);
    const rawLimit = parseInt(req.query.limit as string, 10);
    // We count using 10 digits (0, 1, 2, 3, 4, 5, 6, 7, 8, 9). This is called Base-10.

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

    const movies = await movieService.findAllMoviesAdmin(page, limit);
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    logger.error(`Get all Movies Admin error: ${(error as Error).message}`);
    next(error);
  }
};

export const getMovieById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movieId = req.params.id as string;
    const movie = await movieService.findMovieById(movieId);
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    logger.error(`Get Movie by id error: ${(error as Error).message}`);
    next(error);
  }
};

export const getTopMovieByRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawLimit = parseInt(req.query.limit as string, 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

    const movies = await movieService.findTopMovieByRating(limit);
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    logger.error(`Get top movie by rating error: ${(error as Error).message}`);
    next(error);
  }
};

export const updateMovie = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movieId = req.params.id as string;
    const validatedData = updateMovieSchema.parse(req.body) as UpdateMovieInput;
    const fileBuffer = req.file?.buffer;

    const movie = await movieService.updateMovie(
      movieId,
      validatedData,
      fileBuffer,
    );
    logger.info(`Movie updated successfully: ${movie.title}`);

    return res.status(200).json({
      success: true,
      message: "Movie updated successfuly",
      data: movie,
    });
  } catch (error) {
    logger.error(`Update movie error: ${(error as Error).message}`);
    next(error);
  }
};
