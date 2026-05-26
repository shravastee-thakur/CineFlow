import { Request, Response, NextFunction } from "express";
import * as screenService from "../services/screenService.js";
import logger from "../utils/logger.js";
import {
  createScreenSchema,
  CreateScreenInput,
  updateScreenSchema,
  UpdateScreenInput,
} from "../validators/screenValidator.js";
import mongoose from "mongoose";

export const createScreen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsedData = createScreenSchema.parse(req.body) as CreateScreenInput;

    const screenPayload = {
      ...parsedData,
      theater: new mongoose.Types.ObjectId(parsedData.theater),
    };

    const screen = await screenService.createScreen(screenPayload);
    logger.info(`Screen created successfully : ${screen.name}`);

    return res.status(201).json({
      success: true,
      message: "Screen created successfully",
      data: screen,
    });
  } catch (error) {
    logger.error(`Create Screen error: ${(error as Error).message}`);
    next(error);
  }
};

export const getScreensByTheater = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const theaterId = req.params.id as string;
    const screens = await screenService.findScreensByTheater(theaterId);

    return res.status(200).json({
      success: true,
      data: screens,
    });
  } catch (error) {
    logger.error(`Get Screen By Theater error: ${(error as Error).message}`);
    next(error);
  }
};

export const getScreenById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenId = req.params.id as string;
    const screen = await screenService.findScreenById(screenId);

    return res.status(200).json({
      success: true,
      data: screen,
    });
  } catch (error) {
    logger.error(`Get Screen By Id error: ${(error as Error).message}`);
    next(error);
  }
};

export const updateScreen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenId = req.params.id as string;
    const parsedData = updateScreenSchema.parse(req.body) as UpdateScreenInput;

    const screenPayload: any = { ...parsedData };
    if (parsedData.theater) {
      screenPayload.theater = new mongoose.Types.ObjectId(parsedData.theater);
    }

    const screen = await screenService.updateScreen(screenId, screenPayload);
    logger.info(`Screen updated successfully: ${screen.name}`);

    return res.status(200).json({
      success: true,
      message: "Screen updated successfuly",
      data: screen,
    });
  } catch (error) {
    logger.error(`Update Screen error: ${(error as Error).message}`);
    next(error);
  }
};

export const deleteScreen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const screenId = req.params.id as string;

    const result = await screenService.deleteScreen(screenId);
    logger.info(`Screen soft deleted successfully: ${screenId}`);

    return res.status(200).json({
      success: true,
      message: "Screen removed from active listings",
      data: result,
    });
  } catch (error) {
    logger.error(`Delete Screen error: ${(error as Error).message}`);
    next(error);
  }
};
