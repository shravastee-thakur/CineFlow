import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";

interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  releaseDate: string;
  language: string[];
  posterImage?: { url: string; public_id: string };
  rating: number;
  format: string[];
  status: "coming_soon" | "now_showing" | "ended";
}

interface MovieFormData extends Omit<Movie, "_id" | "posterImage"> {
  posterFile?: File | null;
  posterPreview?: string;
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

const GENRES = [
  "Action",
  "Drama",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Horror",
  "Comedy",
];
const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Malayalam"];
const FORMATS = ["2D", "3D", "IMAX", "4DX", "Dolby"];
const STATUSES: Movie["status"][] = ["coming_soon", "now_showing", "ended"];

const ITEMS_PER_PAGE = 10;

const MovieManager = () => {
  const { role } = useAuthStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    description: "",
    duration: 0,
    genre: [],
    releaseDate: "",
    language: [],
    rating: 0,
    format: [],
    status: "coming_soon",
    posterFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetchMovies = useCallback(
    async (page: number) => {
      if (role !== "admin") return;
      setIsFetching(true);
      try {
        const res = await api.get<MoviesResponse>(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getAllMoviesAdmin`,
          { params: { page, limit: ITEMS_PER_PAGE } },
        );

        if (res.data.success) {
          setMovies(res.data.data.movies);
          setCurrentPage(res.data.data.currentPage);
          setTotalPages(res.data.data.totalPages);
          setTotalMovies(res.data.data.totalMovies);
        }
      } catch (err: any) {
        let message = "Something went wrong. Please try again.";
        if (err.response?.data?.message) message = err.response.data.message;
        else if (err instanceof Error) message = err.message;
        toast.error(message, {
          style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
        });
      } finally {
        setIsFetching(false);
      }
    },
    [role],
  );

  useEffect(() => {
    if (role === "admin") fetchMovies(1);
  }, [role, fetchMovies]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchMovies(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileSelect(file);
  }, []);

  const handleFileSelect = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      posterFile: file,
      posterPreview: URL.createObjectURL(file),
    }));
  };

  const handleChange = (field: keyof MovieFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (
    field: "genre" | "language" | "format",
    value: string,
  ) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("duration", String(formData.duration));
      payload.append("releaseDate", formData.releaseDate);
      payload.append("rating", String(formData.rating));
      payload.append("status", formData.status);
      formData.genre.forEach((g) => payload.append("genre", g));
      formData.language.forEach((l) => payload.append("language", l));
      formData.format.forEach((f) => payload.append("format", f));
      if (formData.posterFile)
        payload.append("posterImage", formData.posterFile);

      if (editingMovie) {
        const res = await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/updateMovie/${editingMovie._id}`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (res.data.success)
          toast.success(res.data.message, {
            style: {
              borderRadius: "10px",
              background: "#F0E76F",
              color: "#333",
            },
          });
      } else {
        const res = await api.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/createMovie`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        if (res.data.success)
          toast.success(res.data.message, {
            style: {
              borderRadius: "10px",
              background: "#F0E76F",
              color: "#333",
            },
          });
      }
      setIsModalOpen(false);
      resetForm();
      fetchMovies(currentPage);
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";
      if (err.response?.data?.message) message = err.response.data.message;
      else if (err instanceof Error) message = err.message;
      toast.error(message, {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: 0,
      genre: [],
      releaseDate: "",
      language: [],
      rating: 0,
      format: [],
      status: "coming_soon",
      posterFile: null,
      posterPreview: undefined,
    });
    setEditingMovie(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      ...movie,
      posterPreview: movie.posterImage?.url,
      posterFile: null,
    });
    setIsModalOpen(true);
  };

  // Generate page numbers for pagination (sliding window)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Manage Movies</h2>
          <p className="text-sm text-slate-400 mt-1">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, totalMovies)} of
            {totalMovies} movies
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
        >
          + Add Movie
        </button>
      </div>

      {/* Movie List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-300">
              <tr>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isFetching ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="w-12 h-18 bg-slate-800 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-800 rounded w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 bg-slate-800 rounded w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-800 rounded w-8" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 bg-slate-800 rounded w-4 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <img
                        src={
                          movie.posterImage?.url ||
                          "https://via.placeholder.com/60x90"
                        }
                        alt={movie.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {movie.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          movie.status === "now_showing"
                            ? "bg-green-500/10 text-green-400"
                            : movie.status === "coming_soon"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {movie.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-400">
                      ★ {movie.rating}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(movie)}
                        className="text-slate-400 hover:text-amber-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No movies found. Click "Add Movie" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isFetching}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-3 py-1.5 text-sm text-slate-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    disabled={isFetching}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      currentPage === page
                        ? "bg-amber-500 text-slate-950"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isFetching}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-semibold text-white">
                {editingMovie ? "Edit Movie" : "Add Movie"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Poster Image{" "}
                  {!editingMovie && <span className="text-red-400">*</span>}
                </label>
                <div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-800/30"
                >
                  {formData.posterPreview ? (
                    <img
                      src={formData.posterPreview}
                      alt="Preview"
                      className="mx-auto h-40 object-contain rounded"
                    />
                  ) : (
                    <div className="text-slate-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Drag & drop or click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                  />
                </div>
                {editingMovie && formData.posterPreview && (
                  <p className="text-xs text-slate-500 mt-1">
                    Keep existing poster or upload a new one
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Duration (min) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration || ""}
                    onChange={(e) =>
                      handleChange("duration", Number(e.target.value))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* Selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Release Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) =>
                      handleChange("releaseDate", e.target.value)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rating (0-5) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || ""}
                    onChange={(e) =>
                      handleChange("rating", Number(e.target.value))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-selects */}
              {(["genre", "language", "format"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                    {field}{" "}
                    {field !== "format" && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(field === "genre"
                      ? GENRES
                      : field === "language"
                        ? LANGUAGES
                        : FORMATS
                    ).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleArrayToggle(field, opt)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          (formData[field] as string[]).includes(opt)
                            ? "bg-amber-500 text-slate-950 border-amber-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-end gap-3">
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
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-medium rounded-lg transition-colors"
                >
                  {isLoading
                    ? "Saving..."
                    : editingMovie
                      ? "Update Movie"
                      : "Create Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManager;
