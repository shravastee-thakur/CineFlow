import { Request, Response, NextFunction } from "express";
import * as theaterService from "../services/theaterService.js";
import logger from "../utils/logger.js";
import {
  createTheaterSchema,
  CreateTheaterInput,
  updateTheaterSchema,
  UpdateTheaterInput,
} from "../validators/theaterValidator.js";

export const createTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createTheaterSchema.parse(
      req.body,
    ) as CreateTheaterInput;

    const theater = await theaterService.createTheater(validatedData);
    logger.info(`Theater created successfully : ${theater.name}`);

    return res.status(201).json({
      success: true,
      message: "Theater created successfully",
      data: theater,
    });
  } catch (error) {
    logger.error(`Create Theater error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllTheaters = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawPage = parseInt(req.query.page as string, 10);
    const rawLimit = parseInt(req.query.limit as string, 10);

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

    const theaters = await theaterService.findAllTheaters(page, limit);

    return res.status(200).json({
      success: true,
      data: theaters,
      pagination: {
        currentPage: theaters.currentPage,
        totalPages: theaters.totalPages,
        totalBookings: theaters.totalTheaters,
      },
    });
  } catch (error) {
    logger.error(`Get All Theaters error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllTheatersAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawPage = parseInt(req.query.page as string, 10);
    const rawLimit = parseInt(req.query.limit as string, 10);

    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50);

    const theaters = await theaterService.findAllTheatersAdmin(page, limit);

    return res.status(200).json({
      success: true,
      data: theaters,
      pagination: {
        currentPage: theaters.currentPage,
        totalPages: theaters.totalPages,
        totalBookings: theaters.totalTheaters,
      },
    });
  } catch (error) {
    logger.error(`Get All Theaters Admin error: ${(error as Error).message}`);
    next(error);
  }
};

export const getTheaterById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;

    const theater = await theaterService.findTheaterById(theaterId);
    return res.status(200).json({ success: true, data: theater });
  } catch (error) {
    logger.error(`Get Theater By Id error: ${(error as Error).message}`);
    next(error);
  }
};

export const getTheaterByCity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const city = req.params.city as string;

    const theaters = await theaterService.findTheaterByCity(city);
    return res.status(200).json({ success: true, data: theaters });
  } catch (error) {
    logger.error(`Get Theaters By City error: ${(error as Error).message}`);
    next(error);
  }
};

export const updateTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;
    const validatedData = updateTheaterSchema.parse(
      req.body,
    ) as UpdateTheaterInput;

    const theater = await theaterService.updateTheater(
      theaterId,
      validatedData,
    );
    logger.info(`Theater updated successfully: ${theater.name}`);

    return res.status(200).json({
      success: true,
      message: "Theater updated successfuly",
      data: theater,
    });
  } catch (error) {
    logger.error(`Update Theater error: ${(error as Error).message}`);
    next(error);
  }
};

export const deleteTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;

    const result = await theaterService.deleteTheater(theaterId);

    logger.info(
      `Theater ${theaterId} soft deleted. ${result.screensAffected} screens cascade deleted.`,
    );

    return res.status(200).json({
      success: true,
      message: "Theater removed from active listings",
      data: result,
    });
  } catch (error) {
    logger.error(`Delete Theater error: ${(error as Error).message}`);
    next(error);
  }
};

export const restoreTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;
    const theater = await theaterService.restoreTheater(theaterId);
    logger.info(`Theater restored: ${theaterId}`);
    return res.status(200).json({
      success: true,
      message: "Theater restored successfully",
      data: theater,
    });
  } catch (error) {
    logger.error(`Restore Theater error: ${(error as Error).message}`);
    next(error);
  }
};

export const getAllCities = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cities = await theaterService.findAllCities();

    return res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    logger.error(`Failed to fetch cities: ${(error as Error).message}`);
    next(error);
  }
};
