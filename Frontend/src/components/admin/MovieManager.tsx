import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, Edit2 } from "lucide-react";
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

const MovieManager = () => {
  const { role } = useAuthStore();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchMovies = useCallback(async () => {
    if (role !== "admin") return;
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/getAllMoviesAdmin`,
        {
          params: { page: 1, limit: 10 },
        },
      );
      if (res.data.success) setMovies(res.data.data.movies);
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message, {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    }
  }, []);

  useEffect(() => {
    if (role === "admin") {
      fetchMovies();
    }
  }, [role, fetchMovies]);

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

      if (formData.posterFile) {
        payload.append("posterImage", formData.posterFile);
      }

      if (editingMovie) {
        const res = await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/updateMovie/${editingMovie._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        console.log(res);
        if (res.data.success) {
          toast.success(res.data.message, {
            style: {
              borderRadius: "10px",
              background: "#AAFFC7",
              color: "#333",
            },
          });
        }
      } else {
        const res = await api.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/movies/createMovie`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        console.log(res);

        if (res.data.success) {
          toast.success(res.data.message, {
            style: {
              borderRadius: "10px",
              background: "#AAFFC7",
              color: "#333",
            },
          });
        }
      }

      setIsModalOpen(false);
      resetForm();
      fetchMovies();
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
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
      // Keep existing poster preview, but posterFile is null (no re-upload unless user changes)
      posterPreview: movie.posterImage?.url,
      posterFile: null,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Manage Movies</h2>
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
              {movies.map((movie) => (
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
                  <td className="px-4 py-3 text-amber-400">★ {movie.rating}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(movie)}
                      className="text-slate-400 hover:text-amber-400"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
