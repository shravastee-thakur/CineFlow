import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

interface Movie {
  _id: string;
  title: string;
  genre: string[];
  language: string[];
  rating: number;
  format: string[];
  posterImage?: { url: string };
  status: "coming_soon" | "now_showing" | "ended";
}

interface MoviesResponse {
  success: boolean;
  data: {
    movies: Movie[];
    currentPage: number;
    totalPages: number;
    totalMovies: number;
  };
}

const FILTER_OPTIONS = {
  genre: [
    "Action",
    "Drama",
    "Sci-Fi",
    "Thriller",
    "Animation",
    "Horror",
    "Musical",
    "Comedy",
  ],
  language: ["English", "Hindi", "Tamil", "Telugu", "Malayalam"],
  rating: ["2+", "3+", "4+"],
  format: ["IMAX", "2D", "3D", "4DX", "Dolby"],
};

const ITEMS_PER_PAGE = 10;
const INITIAL_DISPLAY = 5;

export default function NewReleasesSection() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: "",
    language: "",
    rating: "",
    format: "",
  });

  // Fetch ALL movies (backend doesn't support filters)
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all movies at once
      const res = await api.get<MoviesResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getAllMoviesUser`,
        { params: { page: 1, limit: 100 } }, // Get all movies
      );

      if (res.data.success) {
        setAllMovies(res.data.data.movies);
      }
    } catch {
      toast.error("Failed to load movies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Client-side filtering
  const filteredMovies = useMemo(() => {
    return allMovies.filter((movie) => {
      return (
        (!filters.genre || movie.genre.includes(filters.genre)) &&
        (!filters.language || movie.language.includes(filters.language)) &&
        (!filters.rating ||
          movie.rating >= Number(filters.rating.replace("+", ""))) &&
        (!filters.format || movie.format.includes(filters.format))
      );
    });
  }, [allMovies, filters]);

  // Pagination on filtered results
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const displayedMovies = useMemo(() => {
    if (!showAll) {
      return filteredMovies.slice(0, INITIAL_DISPLAY);
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMovies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMovies, showAll, currentPage]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const resetFilters = () => {
    setFilters({ genre: "", language: "", rating: "", format: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getStatusBadge = (status: Movie["status"]) => {
    switch (status) {
      case "now_showing":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "coming_soon":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  // Simple page numbers
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="py-6 md:py-10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
              New Releases
            </h2>
            {showAll && (
              <p className="text-sm text-slate-400 mt-1">
                Showing {displayedMovies.length} of {filteredMovies.length}{" "}
                movies
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 sm:pb-0 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
              {(Object.keys(filters) as Array<keyof typeof filters>).map(
                (key) => (
                  <select
                    key={key}
                    value={filters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    aria-label={`Filter by ${key}`}
                    className="flex-shrink-0 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 capitalize"
                  >
                    <option value="">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                    {FILTER_OPTIONS[key].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ),
              )}
              {(filters.genre ||
                filters.language ||
                filters.rating ||
                filters.format) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 whitespace-nowrap px-2"
                >
                  Clear All
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowAll(!showAll);
                setCurrentPage(1);
              }}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap transition-colors"
            >
              {showAll ? "View Less ↑" : "View All →"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(showAll ? ITEMS_PER_PAGE : INITIAL_DISPLAY)].map(
              (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] rounded-xl bg-slate-800 mb-2" />
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ),
            )}
          </div>
        )}

        {/* Movie Grid - 5 per row */}
        {!isLoading && displayedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayedMovies.map((movie) => (
              <Link
                key={movie._id}
                to={`/movie/${movie._id}`}
                className="group block focus:outline-none"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-amber-500/50 transition-colors mb-2">
                  <img
                    src={
                      movie.posterImage?.url ||
                      "https://via.placeholder.com/300x450"
                    }
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded border ${getStatusBadge(movie.status)}`}
                  >
                    {movie.status.replace("_", " ")}
                  </span>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-700">
                    <svg
                      className="w-3 h-3 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium text-white">
                      {movie.rating}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {movie.genre[0]} • {movie.language[0]}
                </p>
              </Link>
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No movies match your filters</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Pagination - Only show when viewing all */}
        {showAll && !isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    currentPage === page
                      ? "bg-amber-500 text-slate-900"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
