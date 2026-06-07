import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, X, Filter, RefreshCw, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";
import { useShowStore } from "../../store/showStore";

interface Theater {
  _id: string;
  name: string;
}

interface Show {
  _id: string;
  movie: string;
  screen: string;
  theater: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "cancelled" | "completed";
  bookedSeats: string[];
  isDeleted: boolean;
}

interface Movie {
  _id: string;
  title: string;
}

interface Screen {
  _id: string;
  name: string;
  theater: string;
}

const toastSuccessStyle = {
  borderRadius: "10px",
  background: "#AAFFC7",
  color: "#333",
};
const toastErrorStyle = {
  borderRadius: "10px",
  background: "#FFC7C7",
  color: "#333",
};

export default function ShowManager() {
  const {
    selectedTheaterId,
    selectedScreenId,
    selectedMovieId,
    showCancelled,
    includeDeleted,
    setSelectedTheater,
    setScreen,
    setMovie,
    toggleCancelled,
    toggleIncludeDeleted,
    clearFilters,
  } = useShowStore();

  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Show | null>(null);
  const [form, setForm] = useState({ movie: "", screen: "", startTime: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const getMovieTitle = (id: string) =>
    movies.find((m) => m._id === id)?.title || "Unknown Movie";
  const getScreenName = (id: string) =>
    screens.find((s) => s._id === id)?.name || "Unknown Screen";
  const getTheaterName = (id: string) =>
    theaters.find((t) => t._id === id)?.name || "Unknown Theater";

  // for drop down
  const fetchTheaters = useCallback(async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/getAllTheatersAdmin`,
        { params: { page: 1, limit: 100 } },
      );
      const data = res.data.data?.theater || [];

      setTheaters(data);

      // Removed the forced auto-select trap. The admin must explicitly choose a filter.
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load theaters", {
        style: toastErrorStyle,
      });
    }
  }, []);

  const fetchScreens = useCallback(async () => {
    if (!selectedTheaterId) {
      setScreens([]);
      return;
    }
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/screens/getScreensByTheaterAdmin/${selectedTheaterId}`,
      );
      const data = res.data.data || res.data.screens || [];
      setScreens(data);
      if (
        selectedScreenId &&
        !data.find((s: Screen) => s._id === selectedScreenId)
      )
        setScreen(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load screens", {
        style: toastErrorStyle,
      });
    }
  }, [selectedTheaterId, selectedScreenId, setScreen]);

  const fetchMovies = useCallback(async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getAllMoviesAdmin`,
        { params: { page: 1, limit: 100, select: "title" } },
      );
      setMovies(res.data.data?.movies || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load movies", {
        style: toastErrorStyle,
      });
    }
  }, []);

  const fetchShows = useCallback(async () => {
    // If no filters are selected, do not fetch a massive global list of shows
    if (!selectedTheaterId && !selectedScreenId && !selectedMovieId) {
      setShows([]);
      return;
    }

    setIsFetching(true);
    try {
      let url = "";
      if (selectedScreenId)
        url = `/api/v1/shows/getShowsByScreenAdmin/${selectedScreenId}`;
      else if (selectedMovieId)
        url = `/api/v1/shows/getShowsByMovieAdmin/${selectedMovieId}`;
      else if (selectedTheaterId)
        url = `/api/v1/shows/getShowsByTheaterAdmin/${selectedTheaterId}`;

      const res = await api.get(`${import.meta.env.VITE_BACKEND_URL}${url}`);
      console.log(res);

      setShows(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load shows", {
        style: toastErrorStyle,
      });
    } finally {
      setIsFetching(false);
    }
  }, [selectedTheaterId, selectedScreenId, selectedMovieId]);

  useEffect(() => {
    fetchTheaters();
    fetchMovies();
  }, [fetchTheaters, fetchMovies]);
  useEffect(() => {
    fetchScreens();
  }, [selectedTheaterId, fetchScreens]);
  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const openCreateModal = () => {
    if (!selectedTheaterId)
      return toast.error("Please select a theater from the filters first", {
        style: toastErrorStyle,
      });
    setEditing(null);
    setForm({ movie: "", screen: selectedScreenId || "", startTime: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (show: Show) => {
    setEditing(show);
    setForm({
      movie: show.movie,
      screen: show.screen,
      startTime: new Date(show.startTime).toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.movie || !form.screen || !form.startTime) {
      return toast.error("All fields are required", { style: toastErrorStyle });
    }

    setIsLoading(true);
    try {
      const payload = {
        movie: form.movie,
        screen: form.screen,
        startTime: form.startTime,
      };

      if (editing) {
        const res = await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/shows/updateShow/${editing._id}`,
          payload,
        );
        toast.success(res.data.message || "Show updated", {
          style: toastSuccessStyle,
        });
      } else {
        const res = await api.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/shows/createShow`,
          payload,
        );
        toast.success(res.data.message || "Show created", {
          style: toastSuccessStyle,
        });
      }

      setIsModalOpen(false);
      setForm({ movie: "", screen: "", startTime: "" });
      setEditing(null);
      fetchShows();
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Operation failed";
      toast.error(message, { style: toastErrorStyle });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this show? This will release all booked seats."))
      return;
    try {
      const res = await api.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/shows/cancelShow/${id}`,
      );
      toast.success(res.data.message || "Show cancelled", {
        style: toastSuccessStyle,
      });
      fetchShows();
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Cancel failed";
      toast.error(message, { style: toastErrorStyle });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

  const activeFilterCount = [
    selectedTheaterId,
    selectedScreenId,
    selectedMovieId,
  ].filter(Boolean).length;

  const filteredShows = shows.filter((show) => {
    if (!includeDeleted && show.isDeleted) return false;
    if (!showCancelled && show.status === "cancelled") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Manage Shows</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTheaterId || ""}
              onChange={(e) => {
                setSelectedTheater(e.target.value || null);
                setScreen(null);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none min-w-[150px]"
            >
              <option value="">All Theaters</option>
              {theaters.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedScreenId || ""}
            onChange={(e) => setScreen(e.target.value || null)}
            disabled={!selectedTheaterId}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All Screens</option>
            {screens.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMovieId || ""}
            onChange={(e) => setMovie(e.target.value || null)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none min-w-[150px]"
          >
            <option value="">All Movies</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>

          <button
            onClick={toggleCancelled}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border ${showCancelled ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"}`}
          >
            {showCancelled ? "Show Cancelled" : "Hide Cancelled"}
          </button>

          <button
            onClick={toggleIncludeDeleted}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors border ${includeDeleted ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"}`}
          >
            {includeDeleted ? "Show Deleted" : "Hide Deleted"}
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
          >
            + Add Show
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-4 py-3">Movie</th>
              <th className="px-4 py-3">Screen</th>
              <th className="px-4 py-3">Theater</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isFetching ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading shows...
                  </div>
                </td>
              </tr>
            ) : filteredShows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  <p className="text-lg font-medium mb-1">No shows found</p>
                  <p className="text-sm">
                    {activeFilterCount > 0
                      ? "Try adjusting your filters."
                      : "Select a theater, screen, or movie filter to view shows."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredShows.map((show) => (
                <tr
                  key={show._id}
                  className={`hover:bg-slate-800/30 transition-colors ${show.isDeleted ? "bg-slate-900/70" : ""} ${show.status === "cancelled" ? "bg-red-900/10" : ""}`}
                >
                  <td
                    className={`px-4 py-3 font-medium ${show.isDeleted ? "text-slate-500 line-through" : "text-white"}`}
                  >
                    {getMovieTitle(show.movie)}
                  </td>
                  <td
                    className={`px-4 py-3 ${show.isDeleted ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {getScreenName(show.screen)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {getTheaterName(show.theater)}
                  </td>
                  <td
                    className={`px-4 py-3 ${show.isDeleted ? "text-slate-600" : "text-slate-300"}`}
                  >
                    {formatDate(show.startTime)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {show.isDeleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">
                          Deleted
                        </span>
                      )}
                      {show.status === "cancelled" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                          Cancelled
                        </span>
                      ) : show.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-500/10 text-slate-400 rounded-full border border-slate-500/20">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {show.isDeleted ||
                    show.status === "completed" ||
                    show.status === "cancelled" ? (
                      <span className="text-xs text-slate-500 italic">
                        Read-only
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => openEditModal(show)}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                          title="Edit show"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancel(show._id)}
                          className="text-slate-400 hover:text-red-400 transition-colors p-1"
                          title="Cancel show"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editing ? "Edit Show" : "Add Show"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Movie *
                </label>
                <select
                  value={form.movie}
                  onChange={(e) => setForm({ ...form, movie: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">Select Movie</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Screen *
                </label>
                <select
                  value={form.screen}
                  onChange={(e) => setForm({ ...form, screen: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                  disabled={!selectedTheaterId || screens.length === 0}
                >
                  <option value="">
                    {!selectedTheaterId
                      ? "Select a theater first"
                      : screens.length === 0
                        ? "No screens available"
                        : "Select Screen"}
                  </option>
                  {screens.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  End time calculated automatically (movie duration + 15 min
                  buffer)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-slate-950 font-medium rounded-lg transition-colors"
                >
                  {isLoading ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
