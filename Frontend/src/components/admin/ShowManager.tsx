import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

interface Show {
  _id: string;
  movie: { _id: string; title: string };
  screen: { _id: string; name: string };
  startTime: string;
}

export default function ShowManager() {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<{ _id: string; title: string }[]>([]);
  const [screens, setScreens] = useState<{ _id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Show | null>(null);
  const [form, setForm] = useState({ movie: "", screen: "", startTime: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [showsRes, moviesRes, screensRes] = await Promise.all([
        api.get("/api/v1/admin/shows"),
        api.get("/api/v1/admin/movies?select=title"),
        api.get("/api/v1/admin/screens?select=name"),
      ]);
      setShows(showsRes.data.shows);
      setMovies(moviesRes.data.movies);
      setScreens(screensRes.data.screens);
    } catch {
      toast.error("Failed to load data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.movie || !form.screen || !form.startTime)
      return toast.error("All fields are required");
    setIsLoading(true);
    try {
      if (editing) await api.put(`/api/v1/admin/shows/${editing._id}`, form);
      else await api.post("/api/v1/admin/shows", form);
      toast.success(editing ? "Show updated" : "Show created");
      setIsModalOpen(false);
      setForm({ movie: "", screen: "", startTime: "" });
      setEditing(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this show?")) return;
    try {
      await api.patch(`/api/v1/admin/shows/${id}/cancel`);
      toast.success("Show cancelled");
      fetchData();
    } catch {
      toast.error("Cancel failed");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Manage Shows</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ movie: "", screen: "", startTime: "" });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
        >
          + Add Show
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-4 py-3">Movie</th>
              <th className="px-4 py-3">Screen</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {shows.map((show) => (
              <tr key={show._id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-white">
                  {show.movie.title}
                </td>
                <td className="px-4 py-3 text-slate-400">{show.screen.name}</td>
                <td className="px-4 py-3 text-slate-300">
                  {formatDate(show.startTime)}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(show);
                      setForm({
                        movie: show.movie._id,
                        screen: show.screen._id,
                        startTime: show.startTime.slice(0, 16),
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel(show._id)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
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
                className="text-slate-400 hover:text-white"
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
                >
                  <option value="">Select Screen</option>
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
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-medium rounded-lg transition-colors"
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
