import Movie, { IMovie } from "../models/movieModel.js";
import { HydratedDocument } from "mongoose";

export type MovieDocument = HydratedDocument<IMovie>;

export type CreateMovieData = Pick<
  IMovie,
  | "title"
  | "description"
  | "duration"
  | "genre"
  | "releaseDate"
  | "language"
  | "posterImage"
  | "rating"
  | "format"
  | "status"
>;

export type UpdateMovieData = Partial<CreateMovieData>;

export const createMovie = async (
  data: CreateMovieData,
): Promise<MovieDocument> => {
  return Movie.create(data);
};

export const findAllMovies = async (
  page: number = 1,
  limit: number = 10,
): Promise<MovieDocument[]> => {
  const skip = (page - 1) * limit;

  return Movie.find({ status: { $in: ["coming_soon", "now_showing"] } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

export const countAllMovies = (): Promise<number> => {
  return Movie.countDocuments({
    status: { $in: ["coming_soon", "now_showing"] },
  }).exec();
};

export const findMovieById = async (
  MovieId: string,
): Promise<MovieDocument | null> => {
  return Movie.findById(MovieId).exec();
};

export const findMovieByTitle = async (
  title: string,
): Promise<MovieDocument | null> => {
  const escapeRegex = (text: string) =>
    text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

  const safeTitle = escapeRegex(title);
  return Movie.findOne({
    title: new RegExp(`^${safeTitle}$`, "i"),
    status: { $in: ["coming_soon", "now_showing"] },
  }).exec();
};

export const findTopMovieByRating = async (
  limit: number = 10,
): Promise<MovieDocument[]> => {
  return Movie.find().sort({ rating: -1 }).limit(limit).exec();
};

export const updateMovie = async (
  movieId: string,
  data: UpdateMovieData,
): Promise<MovieDocument | null> => {
  return Movie.findByIdAndUpdate(movieId, data, {
    new: true,
    runValidators: true,
  }).exec();
};
