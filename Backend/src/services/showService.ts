import * as showRepo from "../repositories/showRepo.js";
import {
  ShowDocument,
  CreateShowData,
} from "../repositories/showRepo.js";
import * as movieRepo from "../repositories/movieRepo.js";
import { ApiError } from "../utils/apiError.js";

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
  showData: CreateShowData,
): Promise<ShowDto> => {
  // Fetch the movie to get its duration
  const movie = await movieRepo.findMovieById(showData.movie.toString());
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

  const payload: CreateShowData = {
    ...showData,
    endTime: actualEndTime,
  };

  const show = await showRepo.createShow(payload);

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

export const cancelShow = async (showId: string): Promise<ShowDto> => {
  const show = await showRepo.findShowById(showId);
  if (!show) throw new ApiError(404, "Show not found");

  show.status = "cancelled";
  await show.save();

  return mapToShowDto(show);
};
