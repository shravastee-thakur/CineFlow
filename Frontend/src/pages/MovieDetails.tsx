import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";

interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  releaseDate: string;
  language: string[];
  posterImage?: { url: string };
  rating: number;
  format: string[];
  status: "coming_soon" | "now_showing" | "ended";
}

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await api.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getMovieById/${id}`,
        );
        if (res.data.success) {
          setMovie(res.data.data);
        }
      } catch {
        toast.error("Failed to load movie details");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id, navigate]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 animate-pulse">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[2/3] bg-slate-900 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-900 rounded w-2/3" />
              <div className="h-6 bg-slate-900 rounded w-1/2" />
              <div className="h-32 bg-slate-900 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Movie Poster */}
          <div className="md:col-span-5 lg:col-span-4 flex-shrink-0 mx-auto md:mx-0 w-full max-w-[320px]">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <img
                src={movie.posterImage?.url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Movie Details */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center">
            {/* Movie Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {movie.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-white">
                {movie.rating}
              </span>
              <span className="text-slate-400 text-2xl">/ 5</span>
            </div>

            {/* Time and Date */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>{formatDate(movie.releaseDate)}</span>
              </div>
            </div>

            {/* Genre */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 text-sm rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Language
              </h3>
              <p className="text-white text-lg">{movie.language.join(", ")}</p>
            </div>

            {/* Movie Details (Description) */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-slate-400 mb-2 ">
                About the Movie
              </h3>
              <p className="text-slate-100 leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Book Ticket Button */}
            <button
              onClick={() => navigate(`/book/${movie._id}`)}
              disabled={movie.status !== "now_showing"}
              className="w-full md:w-fit mt-2 px-8 py-4 md:py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-bold text-lg md:text-base rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {movie.status === "now_showing" ? "Book Tickets" : "Coming Soon"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
