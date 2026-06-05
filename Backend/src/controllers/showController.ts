import { Request, Response, NextFunction } from "express";
import * as showService from "../services/showService.js";
import logger from "../utils/logger.js";
import {
  createShowSchema,
  CreateShowInput,
  updateShowSchema,
  UpdateShowInput,
} from "../validators/showValidator.js";

export const createShow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedData = createShowSchema.parse(req.body) as CreateShowInput;

    const show = await showService.createShow(parsedData);
    logger.info(`Show created successfully: ${show._id}`);

    return res.status(201).json({
      success: true,
      message: "Show scheduled successfully",
      data: show,
    });
  } catch (error) {
    logger.error(`Create Show Error: ${(error as Error).message}`);
    next(error);
  }
};

export const getShowsByTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;
    const shows = await showService.findShowsByTheater(theaterId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(`Get Shows By Theater Error: ${(error as Error).message}`);
    next(error);
  }
};

export const getShowsByTheaterAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;
    const shows = await showService.findShowsByTheaterAdmin(theaterId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(
      `Get Shows By Theater Admin Error: ${(error as Error).message}`,
    );
    next(error);
  }
};

export const getShowById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const showId = req.params.id as string;
    const show = await showService.findShowById(showId);

    return res.status(200).json({
      success: true,
      data: show,
    });
  } catch (error) {
    logger.error(`Get Show By Id Error: ${(error as Error).message}`);
    next(error);
  }
};

export const getShowsByScreen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenId = req.params.id as string;
    const shows = await showService.findShowsByScreen(screenId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(`Get Shows By Screen Error: ${(error as Error).message}`);
    next(error);
  }
};

export const getShowsByScreenAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenId = req.params.id as string;
    const shows = await showService.findShowsByScreenAdmin(screenId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(
      `Get Shows By Screen Admin Error: ${(error as Error).message}`,
    );
    next(error);
  }
};

export const getShowsByMovie = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movieId = req.params.id as string;
    const shows = await showService.findShowsByMovie(movieId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(`Get Shows By Movie Error: ${(error as Error).message}`);
    next(error);
  }
};

export const getShowsByMovieAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movieId = req.params.id as string;
    const shows = await showService.findShowsByMovieAdmin(movieId);

    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    logger.error(`Get Shows By Movie Admin Error: ${(error as Error).message}`);
    next(error);
  }
};

export const updateShow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const showId = req.params.id as string;
    const parsedData = updateShowSchema.parse(req.body) as UpdateShowInput;

    const show = await showService.updateShow(showId, parsedData);
    logger.info(`Show updated successfully: ${show._id}`);

    return res.status(200).json({
      success: true,
      message: "Show updated successfully",
      data: show,
    });
  } catch (error) {
    logger.error(`Update Show Error: ${(error as Error).message}`);
    next(error);
  }
};

export const cancelShow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const showId = req.params.id as string;
    const show = await showService.cancelShow(showId);
    logger.info(`Show cancelled successfully: ${showId}`);

    return res.status(200).json({
      success: true,
      message: "Show cancelled successfully",
      data: show,
    });
  } catch (error) {
    logger.error(`Cancel Show Error: ${(error as Error).message}`);
    next(error);
  }
};
