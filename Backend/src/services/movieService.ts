import { uploadImageToCloudinary } from "../config/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import * as movieRepo from "../repositories/movieRepo.js";
import {
  CreateMovieData,
  MovieDocument,
  UpdateMovieData,
} from "../repositories/movieRepo.js";
import { ApiError } from "../utils/apiError.js";
import logger from "../utils/logger.js";

export interface MovieDetailInput extends CreateMovieData {}

export interface MovieDto {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  releaseDate: Date;
  language: string[];
  posterImage?: {
    url: string;
    public_id: string;
  };
  rating: number;
  format: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedMoviesResponse {
  movies: MovieDto[];
  currentPage: number;
  totalPages: number;
  totalMovies: number;
}

const mapToMovieDTO = (movie: MovieDocument): MovieDto => {
  const obj = movie.toObject();
  return {
    _id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    duration: obj.duration,
    genre: obj.genre,
    releaseDate: obj.releaseDate,
    language: obj.language,
    posterImage: obj.posterImage,
    rating: obj.rating,
    format: obj.format,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

export const createMovie = async (
  movieData: MovieDetailInput,
  fileBuffer: Buffer,
): Promise<MovieDto> => {
  const existingMovie = await movieRepo.findMovieByTitle(movieData.title);
  if (existingMovie) {
    throw new ApiError(409, "Movie already exists");
  }

  if (fileBuffer) {
    const uploadImage = await uploadImageToCloudinary(fileBuffer);
    movieData.posterImage = {
      url: uploadImage.secure_url,
      public_id: uploadImage.public_id,
    };
  }

  const movie = await movieRepo.createMovie(movieData);
  return mapToMovieDTO(movie);
};

export const findAllMovies = async (
  page: number,
  limit: number,
): Promise<PaginatedMoviesResponse> => {
  const totalMovies = await movieRepo.countAllMovies();

  const movies = await movieRepo.findAllMovies(page, limit);

  const totalPages = Math.ceil(totalMovies / limit);
  if (!movies) throw new ApiError(404, "Movie not found");

  return {
    movies: movies.map(mapToMovieDTO),
    currentPage: page,
    totalPages,
    totalMovies,
  };
};

export const findMovieById = async (movieId: string): Promise<MovieDto> => {
  const movie = await movieRepo.findMovieById(movieId);
  if (!movie) throw new ApiError(404, "Movie not found");
  return mapToMovieDTO(movie);
};

export const findTopMovieByRating = async (
  limit: number = 10,
): Promise<MovieDto[]> => {
  const movies = await movieRepo.findTopMovieByRating(limit);
  if (!movies) throw new ApiError(404, "Movie not found");
  return movies.map(mapToMovieDTO);
};

export const updateMovie = async (
  movieId: string,
  movieData: UpdateMovieData,
  fileBuffer?: Buffer,
): Promise<MovieDto> => {
  const movie = await movieRepo.findMovieById(movieId);
  if (!movie) throw new ApiError(404, "Movie not found");

  if (fileBuffer) {
    if (movie?.posterImage?.public_id) {
      try {
        // invalidate true to clear the CDN cache immediately
        const deleteResult = await cloudinary.uploader.destroy(
          movie.posterImage.public_id,
          { invalidate: true },
        );

        logger.info(
          `Cloudinary delete result: ${JSON.stringify(deleteResult)}`,
        );

        if (deleteResult.result !== "ok") {
          logger.warn(
            `Failed to delete image. Public ID: ${movie.posterImage.public_id}. Result: ${deleteResult.result}`,
          );
        }
      } catch (cloudinaryError) {
        logger.error(
          `Error deleting old image from Cloudinary: ${(cloudinaryError as Error).message}`,
        );
      }
    }

    const uploadImage = await uploadImageToCloudinary(fileBuffer);
    movieData.posterImage = {
      url: uploadImage.secure_url,
      public_id: uploadImage.public_id,
    };
  }
  Object.assign(movie, movieData);
  await movie.save();

  return mapToMovieDTO(movie);
};
