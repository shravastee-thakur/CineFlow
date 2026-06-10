import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ChevronLeft,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";

interface Movie {
  _id: string;
  title: string;
  duration: number;
  genre: string[];
  rating: number;
  posterImage?: { url: string };
  language: string[];
}

interface Theater {
  _id: string;
  name: string;
  location: string;
  city: string;
}

interface Show {
  _id: string;
  movie: {
    _id: string;
    title?: string;
  };
  screen: {
    _id: string;
    name: string;
    format: string;
  };
  theater: string | { _id: string; name: string };
  startTime: string;
  endTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
}

interface TheaterWithShows {
  theater: Theater;
  shows: Show[];
}

// Generate next 7 days
const generateDates = () => {
  const dates = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      fullDate: date,
      isToday: i === 0,
    });
  }
  return dates;
};

const BookTicketsPage = () => {
  const { id: movieId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeLocation } = useAuthStore();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatersWithShows, setTheatersWithShows] = useState<
    TheaterWithShows[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const dates = useMemo(() => generateDates(), []);

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId || !activeLocation) return;

      setIsLoading(true);
      try {
        // Fetch movie details
        const movieRes = await api.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getMovieById/${movieId}`,
        );
        if (movieRes.data.success) {
          setMovie(movieRes.data.data);
        }

        // Fetch theaters in selected city
        const theatersRes = await api.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/getTheaterByCity/${activeLocation}`,
        );

        if (theatersRes.data.success) {
          const theaters = theatersRes.data.data;

          // Fetch shows for each theater
          const theatersWithShowsData = await Promise.all(
            theaters.map(async (theater: Theater) => {
              const showsRes = await api.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/shows/getShowsByTheater/${theater._id}`,
              );
              const allShows = showsRes.data.data || [];
              console.log(allShows);

              //  Compare show.movie._id with movieId
              // Use UTC date comparison to avoid timezone issues
              const movieShows = allShows.filter((show: Show) => {
                // Compare movie IDs
                const showMovieId =
                  typeof show.movie === "string" ? show.movie : show.movie._id;
                if (showMovieId !== movieId) return false;

                // Compare dates in UTC to avoid timezone mismatches
                const showDate = new Date(show.startTime);
                const selectedUTC = Date.UTC(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                );
                const showUTC = Date.UTC(
                  showDate.getFullYear(),
                  showDate.getMonth(),
                  showDate.getDate(),
                );

                if (showUTC !== selectedUTC) return false;

                const now = new Date();
                const showEndTime = new Date(show.endTime);

                if (showEndTime < now) {
                  return false;
                }

                return true;
              });

              return {
                theater,
                shows: movieShows.sort(
                  (a: Show, b: Show) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime(),
                ),
              };
            }),
          );

          // Filter out theaters with no shows
          const filtered = theatersWithShowsData.filter(
            (t) => t.shows.length > 0,
          );
          setTheatersWithShows(filtered);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast.error(err.response?.data?.message || "Failed to load shows");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [movieId, activeLocation, selectedDate]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleShowSelect = (showId: string) => {
    navigate(`/seat-selection/${showId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-900 rounded w-1/3 mb-6" />
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-16 h-20 bg-slate-900 rounded-xl"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-xl p-6">
                <div className="h-6 bg-slate-800 rounded w-1/2 mb-4" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="h-12 bg-slate-800 rounded-lg w-24"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Movie Details
        </button>

        {/* Movie Header */}
        <div className="flex items-start gap-4 mb-8">
          <img
            src={movie.posterImage?.url}
            alt={movie.title}
            className="w-24 h-36 object-cover rounded-lg shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-medium">
                  {(movie.rating * 2).toFixed(1)}
                </span>
                <span>/10</span>
              </div>
              <span>•</span>
              <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                {movie.language[0]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Select Date
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {dates.map((date) => (
              <button
                key={date.day + String(date.date)}
                onClick={() => setSelectedDate(date.fullDate)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all ${
                  selectedDate.toDateString() === date.fullDate.toDateString()
                    ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50"
                }`}
              >
                <span className="text-xs">{date.day}</span>
                <span className="text-xl">{date.date}</span>
                <span className="text-xs">{date.month}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theaters & Shows */}
        <div className="space-y-6">
          {theatersWithShows.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">
                No shows available for {formatDate(selectedDate)}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Please select another date
              </p>
            </div>
          ) : (
            theatersWithShows.map(({ theater, shows }) => (
              <div
                key={theater._id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
              >
                {/* Theater Info */}
                <div className="mb-4 pb-4 border-b border-slate-800">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {theater.name}
                  </h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {theater.location}, {theater.city}
                  </p>
                </div>

                {/* Show Times */}
                <div className="flex flex-wrap gap-3">
                  {shows.map((show) => (
                    <button
                      key={show._id}
                      onClick={() => handleShowSelect(show._id)}
                      className="group flex flex-col items-center px-4 py-3 bg-slate-800 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/50 rounded-xl transition-all min-w-[100px]"
                    >
                      <span className="text-sm font-medium text-slate-200 group-hover:text-amber-400">
                        {formatTime(show.startTime)}
                      </span>
                      <span className="text-xs text-slate-500 group-hover:text-amber-400/70 mt-1">
                        {show.screen.format}
                      </span>
                      {show.availableSeats < show.totalSeats * 0.2 && (
                        <span className="text-[10px] text-orange-400 mt-1">
                          Filling Fast
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Fast Filling</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTicketsPage;
