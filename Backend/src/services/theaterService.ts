import * as theaterRepo from "../repositories/theaterRepo.js";
import * as screenRepo from "../repositories/screenRepo.js";
import {
  CreateTheaterData,
  TheaterDocument,
  UpdateTheaterData,
} from "../repositories/theaterRepo.js";
import { ApiError } from "../utils/apiError.js";

export interface TheaterDetailInput extends CreateTheaterData {}

export interface TheaterDto {
  _id: string;
  name: string;
  location: string;
  city: string;
  // state: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TheaterAdminDto extends TheaterDto {
  isDeleted: Boolean;
}

export interface PaginatedTheaterResponse {
  theater: TheaterDto[];
  currentPage: number;
  totalPages: number;
  totalTheaters: number;
}
export interface PaginatedTheaterResponseAdmin {
  theater: TheaterAdminDto[];
  currentPage: number;
  totalPages: number;
  totalTheaters: number;
}

function mapToTheaterDto(
  theater: TheaterDocument,
  isAdmin: true,
): TheaterAdminDto;
function mapToTheaterDto(theater: TheaterDocument, isAdmin?: false): TheaterDto;
function mapToTheaterDto(
  theater: TheaterDocument,
  isAdmin: boolean = false,
): TheaterDto | TheaterAdminDto {
  const obj = theater.toObject();

  const baseTheater: TheaterDto = {
    _id: obj._id.toString(),
    name: obj.name,
    location: obj.location,
    city: obj.city,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };

  if (isAdmin) {
    return {
      ...baseTheater,
      isDeleted: obj.isDeleted ?? false,
    } as TheaterAdminDto;
  }

  return baseTheater;
}

export const createTheater = async (
  theaterData: TheaterDetailInput,
): Promise<TheaterDto> => {
  const existingTheater = await theaterRepo.findTheaterByName(theaterData.name);
  if (existingTheater) {
    throw new ApiError(409, "Theater already exists");
  }

  const theater = await theaterRepo.createTheater(theaterData);
  return mapToTheaterDto(theater);
};

export const findAllTheaters = async (
  page: number,
  limit: number,
): Promise<PaginatedTheaterResponse> => {
  const totalTheaters = await theaterRepo.countTheaters(false);
  const theaters = await theaterRepo.findAllTheaters(page, limit, false);

  const totalPages = Math.ceil(totalTheaters / limit);

  return {
    theater: theaters.map((t) => mapToTheaterDto(t, false)),
    currentPage: page,
    totalPages,
    totalTheaters,
  };
};

export const findAllTheatersAdmin = async (
  page: number,
  limit: number,
): Promise<PaginatedTheaterResponseAdmin> => {
  const totalTheaters = await theaterRepo.countTheaters(true);
  const theaters = await theaterRepo.findAllTheaters(page, limit, true);

  const totalPages = Math.ceil(totalTheaters / limit);

  return {
    theater: theaters.map((t) => mapToTheaterDto(t, true)),
    currentPage: page,
    totalPages,
    totalTheaters,
  };
};

export const findTheaterById = async (
  theaterId: string,
): Promise<TheaterDto> => {
  const theater = await theaterRepo.findTheaterById(theaterId);

  if (!theater) throw new ApiError(404, "Theater not found");
  return mapToTheaterDto(theater);
};


export const findTheaterByCity = async (
  city: string,
): Promise<TheaterDto[]> => {
  const theaters = await theaterRepo.findTheaterByCity(city);
  if (!theaters) throw new ApiError(404, "Theater not found");
  return theaters.map((t) => mapToTheaterDto(t, false));
};

export const updateTheater = async (
  theaterId: string,
  theaterData: UpdateTheaterData,
) => {
  const theater = await theaterRepo.findTheaterById(theaterId);
  if (!theater) throw new ApiError(404, "Theater not found");

  Object.assign(theater, theaterData);
  await theater.save();

  return mapToTheaterDto(theater);
};

export const deleteTheater = async (
  theaterId: string,
): Promise<{ success: boolean; screensAffected?: number }> => {
  const theater = await theaterRepo.findTheaterById(theaterId);
  if (!theater) throw new ApiError(404, "Theater not found");

  theater.isDeleted = true;
  await theater.save();

   const { modifiedCount } = await screenRepo.softDeleteScreensByTheater(theaterId);

  return { success: true , screensAffected: modifiedCount};
};

export const restoreTheater = async (
  theaterId: string,
): Promise<TheaterDto> => {
  const theater = await theaterRepo.restoreTheater(theaterId);
  if (!theater) throw new ApiError(404, "Theater not found");
  return mapToTheaterDto(theater);
};
