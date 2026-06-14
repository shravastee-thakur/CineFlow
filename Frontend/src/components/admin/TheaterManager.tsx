import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";
import { useAuthStore } from "../../store/authStore";

interface Theater {
  _id: string;
  name: string;
  location: string;
  city: string;
  isDeleted: boolean;
}

const TheaterManager = () => {
  const { role } = useAuthStore();
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Theater | null>(null);
  const [form, setForm] = useState({ name: "", location: "", city: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTheaters = useCallback(async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/getAllTheatersAdmin?page=1&limit=50`,
      );
      console.log(res);

      if (res.data.success) {
        setTheaters(res.data.data.theater);
      }
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
      fetchTheaters();
    }
  }, [fetchTheaters]);

  // Filter theaters based on toggle state
  const filteredTheaters = theaters.filter((t) =>
    showDeleted ? t.isDeleted : !t.isDeleted,
  );

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editing) {
        const res = await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/updateTheater/${editing._id}`,
          form,
        );
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
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/createTheater`,
          form,
        );
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
      setForm({ name: "", location: "", city: "" });
      setEditing(null);
      fetchTheaters();
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

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/deleteTheater/${id}`,
      );
      if (res.data.success) {
        toast.success(res.data.message, {
          style: {
            borderRadius: "10px",
            background: "#AAFFC7",
            color: "#333",
          },
        });
      }
      fetchTheaters();
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
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Restore this theater?")) return;
    try {
      const res = await api.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/restoreTheater/${id}`,
      );
      if (res.data.success) {
        toast.success(res.data.message, {
          style: {
            borderRadius: "10px",
            background: "#AAFFC7",
            color: "#333",
          },
        });
      }
      fetchTheaters();
    } catch {
      toast.error("Restore failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Manage Theaters</h2>
        <div className="flex items-center gap-3">
          {/* Toggle to show/hide deleted theaters */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          >
            {showDeleted ? <>Hide Deleted</> : <>Show Deleted</>}
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", location: "", city: "" });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
          >
            + Add Theater
          </button>
        </div>
      </div>

      {/* Info banner when showing deleted items */}
      {showDeleted && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-200">
            <p className="font-medium">Showing deleted theaters</p>
            <p className="text-amber-300/80">
              Deleted theaters are hidden from public view. Clicking delete on a
              deleted theater will permanently remove it.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTheaters.map((t) => (
              <tr
                key={t._id}
                className={`hover:bg-slate-800/30 transition-colors ${
                  t.isDeleted ? "bg-slate-900/50" : ""
                }`}
              >
                <td
                  className={`px-4 py-3 font-medium ${t.isDeleted ? "text-slate-500 line-through" : "text-white"}`}
                >
                  {t.name}
                </td>
                <td
                  className={`px-4 py-3 ${t.isDeleted ? "text-slate-600" : "text-slate-400"}`}
                >
                  {t.location || "—"}
                </td>
                <td
                  className={`px-4 py-3 ${t.isDeleted ? "text-slate-600" : "text-slate-400"}`}
                >
                  {t.city}
                </td>
                <td className="px-4 py-3">
                  {t.isDeleted === true ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      Deleted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {t.isDeleted ? (
                    <button
                      onClick={() => handleRestore(t._id)}
                      className="text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Restore theater"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  ) : (
                    // Show Edit and Soft Delete for active theaters
                    <>
                      <button
                        onClick={() => {
                          setEditing(t);
                          setForm({
                            name: t.name,
                            location: t.location,
                            city: t.city,
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                        title="Edit theater"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                        title="Soft delete theater"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {filteredTheaters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="text-slate-500">
                    <p className="text-lg font-medium mb-1">
                      {showDeleted
                        ? "No deleted theaters found"
                        : "No active theaters found"}
                    </p>
                    <p className="text-sm">
                      {showDeleted
                        ? "All theaters are currently active."
                        : "Add your first theater to get started."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editing ? "Edit Theater" : "Add Theater"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Theater Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. PVR Cinemas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. Metro Junction Mall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. Mumbai"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
};

export default TheaterManager;
