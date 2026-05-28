import * as showRepo from "../repositories/showRepo.js";
import {
  ShowDocument,
  CreateShowData,
  UpdateShowData,
} from "../repositories/showRepo.js";
import * as movieRepo from "../repositories/movieRepo.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";
import {
  CreateShowInput,
  UpdateShowInput,
} from "../validators/showValidator.js";

export interface ShowDto {
  _id: string;
  movie: string;
  screen: string;
  startTime: Date;
  endTime: Date;
  bookedSeats: string[];
  status: "scheduled" | "cancelled" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

const mapToShowDto = (show: ShowDocument): ShowDto => {
  const obj = show.toObject();

  return {
    _id: obj._id.toString(),
    movie: obj.movie.toString(),
    screen: obj.screen.toString(),
    startTime: obj.startTime,
    endTime: obj.endTime,
    bookedSeats: obj.bookedSeats,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const createShow = async (
  showData: CreateShowInput,
): Promise<ShowDto> => {
  // Fetch the movie to get its duration
  const movie = await movieRepo.findMovieById(showData.movie);
  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  //  Calculate end time and add the 15 minute cleaning buffer
  const startTimeMs = new Date(showData.startTime).getTime();
  const durationsMs = movie.duration * 60 * 1000;
  const buffers = 15 * 60 * 1000;

  const actualEndTime = new Date(startTimeMs + durationsMs);
  const endTimeWithBuffer = new Date(startTimeMs + durationsMs + buffers);

  // Check for overlapping shows using the buffered time
  const overLapping = await showRepo.findOverlappingShows(
    showData.screen.toString(),
    new Date(showData.startTime),
    endTimeWithBuffer,
  );

  if (overLapping.length > 0) {
    throw new ApiError(
      409,
      "This screen is already booked for the selected time slot. Please account for the 15 minute cleaning buffer.",
    );
  }

  const repoPayload: CreateShowData = {
    movie: new mongoose.Types.ObjectId(showData.movie),
    screen: new mongoose.Types.ObjectId(showData.screen),
    startTime: new Date(showData.startTime),
    endTime: actualEndTime,
  };

  const show = await showRepo.createShow(repoPayload);

  return mapToShowDto(show);
};

export const findShowById = async (showId: string): Promise<ShowDto | null> => {
  const show = await showRepo.findShowById(showId);
  if (!show) throw new ApiError(404, "Show not found");

  return mapToShowDto(show);
};

export const findShowsByScreen = async (
  screenId: string,
): Promise<ShowDto[]> => {
  const shows = await showRepo.findShowsByScreen(screenId);
  return shows.map(mapToShowDto);
};

export const findShowsByMovie = async (movieId: string): Promise<ShowDto[]> => {
  const shows = await showRepo.findShowsByMovie(movieId);

  return shows.map(mapToShowDto);
};

export const updateShow = async (
  showId: string,
  showData: UpdateShowInput,
): Promise<ShowDto> => {
  const show = await showRepo.findShowById(showId);
  if (!show) throw new ApiError(404, "Show not found");

  // Are they changing the movie? Are they moving it to a different screen? Are they changing the start time?

  const finalMovieId = showData.movie
    ? showData.movie.toString()
    : show.movie.toString();

  const finalScreenId = showData.screen
    ? showData.screen.toString()
    : show.screen.toString();

  const finalStartTime = showData.startTime
    ? new Date(showData.startTime)
    : show.startTime;

  // Check exact movie duration
  const movie = await movieRepo.findMovieById(finalMovieId);
  if (!movie) throw new ApiError(404, "Movie not found");

  const startTimeMs = finalStartTime.getTime();
  const durationsMs = movie.duration * 60 * 1000;
  const bufferMs = 15 * 60 * 1000;

  const actualEndTime = new Date(startTimeMs + durationsMs);
  const endTimeWithBuffer = new Date(startTimeMs + durationsMs + bufferMs);

  const overlappingShows = await showRepo.findOverlappingShows(
    finalScreenId,
    finalStartTime,
    endTimeWithBuffer,
    showId,
  );

  if (overlappingShows.length > 0) {
    throw new ApiError(
      409,
      "This screen is already booked for the selected time slot. Please account for the 15 minute cleaning buffer.",
    );
  }

  if (showData.movie) {
    show.movie = new mongoose.Types.ObjectId(showData.movie);
  }
  if (showData.screen) {
    show.screen = new mongoose.Types.ObjectId(showData.screen);
  }
  if (showData.startTime) {
    show.startTime = finalStartTime;
  }

  show.endTime = actualEndTime;

  await show.save();

  return mapToShowDto(show);
};

export const cancelShow = async (showId: string): Promise<ShowDto> => {
  const show = await showRepo.findShowById(showId);
  if (!show) throw new ApiError(404, "Show not found");

  show.status = "cancelled";
  await show.save();

  return mapToShowDto(show);
};
