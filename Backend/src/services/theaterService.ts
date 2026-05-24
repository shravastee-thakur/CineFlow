import * as theaterRepo from "../repositories/theaterRepo.js";
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

export interface PaginatedTheaterResponse {
  theater: TheaterDto[];
  currentPage: number;
  totalPages: number;
  totalTheaters: number;
}

const mapToTheaterDto = (theater: TheaterDocument): TheaterDto => {
  const obj = theater.toObject();
  return {
    _id: obj._id.toString(),
    name: obj.name,
    location: obj.location,
    city: obj.city,
    // state: obj.state,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

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
  const totalTheaters = await theaterRepo.countAllTheaters();
  const theaters = await theaterRepo.findAllTheaters(page, limit);

  const totalPages = Math.ceil(totalTheaters / limit);

  return {
    theater: theaters.map(mapToTheaterDto),
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

// export const findTheaterByState = async (
//   state: string,
// ): Promise<TheaterDto[]> => {
//   const theaters = await theaterRepo.findTheaterByState(state);
//   if (!theaters) throw new ApiError(404, "Theater not found");
//   return theaters.map(mapToTheaterDto);
// };

export const findTheaterByCity = async (
  city: string,
): Promise<TheaterDto[]> => {
  const theaters = await theaterRepo.findTheaterByCity(city);
  if (!theaters) throw new ApiError(404, "Theater not found");
  return theaters.map(mapToTheaterDto);
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
): Promise<{ success: boolean }> => {
  const theater = await theaterRepo.findTheaterById(theaterId);
  if (!theater) throw new ApiError(404, "Theater not found");

  theater.isDeleted = true;
  await theater.save();

  return { success: true };
};
