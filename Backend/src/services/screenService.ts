import * as screenRepo from "../repositories/screenRepo.js";
import {
  ScreenDocument,
  CreateScreenData,
  UpdateScreenData,
} from "../repositories/screenRepo.js";
import { ApiError } from "../utils/apiError.js";

export interface SeatDto {
  seatNumber: string;
  seatType: "standard" | "premium" | "recliner";
  price: number;
  isBroken: boolean;
}

export interface RowDto {
  rowName: string;
  seats: SeatDto[];
}

export interface ScreenDto {
  _id: string;
  theater: string;
  name: string;
  format: "2D" | "3D" | "IMAX" | "4DX";
  audioType: "Standard" | "7.1 Surround" | "Dolby Atmos";
  layout: RowDto[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScreenAdminDto extends ScreenDto {
  isDeleted: Boolean;
}

function mapToScreenDto(screen: ScreenDocument, isAdmin: true): ScreenAdminDto;
function mapToScreenDto(screen: ScreenDocument, isAdmin?: false): ScreenDto;
function mapToScreenDto(
  screen: ScreenDocument,
  isAdmin: boolean = false,
): ScreenDto | ScreenAdminDto {
  const obj = screen.toObject();

  const baseScreen: ScreenDto = {
    _id: obj._id.toString(),
    theater: obj.theater.toString(),
    name: obj.name,
    format: obj.format,
    audioType: obj.audioType,
    layout: obj.layout.map((row) => ({
      rowName: row.rowName,
      seats: row.seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        price: seat.price,
        isBroken: seat.isBroken,
      })),
    })),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };

  if (isAdmin) {
    return {
      ...baseScreen,
      isDeleted: obj.isDeleted,
    } as ScreenAdminDto;
  }

  return baseScreen;
}

export const createScreen = async (
  screenData: CreateScreenData,
): Promise<ScreenDto> => {
  const existingScreen = await screenRepo.findScreenByNameInTheater(
    screenData.theater.toString(),
    screenData.name,
  );

  if (existingScreen) {
    throw new ApiError(
      409,
      "A screen with this name already exists in this theater",
    );
  }

  const screen = await screenRepo.createScreen(screenData);
  return mapToScreenDto(screen);
};

export const findScreensByTheater = async (
  theaterId: string,
): Promise<ScreenDto[]> => {
  const screens = await screenRepo.findScreensByTheater(theaterId, false);
  return screens.map((s) => mapToScreenDto(s, false));
};

export const findScreensByTheaterAdmin = async (
  theaterId: string,
): Promise<ScreenAdminDto[]> => {
  const screens = await screenRepo.findScreensByTheater(theaterId, true);
  return screens.map((s) => mapToScreenDto(s, true));
};

export const findScreenById = async (
  screenId: string,
): Promise<ScreenDto | null> => {
  const screen = await screenRepo.findScreenById(screenId);
  if (!screen) throw new ApiError(404, "Screen not found");

  return mapToScreenDto(screen);
};

export const updateScreen = async (
  screenId: string,
  screenData: UpdateScreenData,
): Promise<ScreenDto> => {
  const screen = await screenRepo.findScreenById(screenId);
  if (!screen) throw new ApiError(404, "Screen not found");

  // 1. Determine what the final name and theater will be after the update
  const newName = screenData.name || screen.name;
  const newTheater = screenData.theater
    ? screenData.theater.toString()
    : screen.theater.toString();

  // 2. Only run the database check if the name OR the theater is actually changing
  if (newName !== screen.name || newTheater !== screen.theater.toString()) {
    const existingScreen = await screenRepo.findScreenByNameInTheater(
      newTheater,
      newName,
    );

    if (existingScreen && existingScreen._id.toString() !== screenId) {
      throw new ApiError(
        409,
        "A screen with this name already exists in this theater",
      );
    }
  }

  Object.assign(screen, screenData);
  await screen.save();

  return mapToScreenDto(screen);
};

export const deleteScreen = async (
  screenId: string,
): Promise<{ success: boolean }> => {
  const screen = await screenRepo.findScreenById(screenId);
  if (!screen) throw new ApiError(404, "Screen not found");

  screen.isDeleted = true;
  await screen.save();

  return { success: true };
};
