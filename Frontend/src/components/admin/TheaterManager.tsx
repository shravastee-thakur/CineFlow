import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

interface Theater {
  _id: string;
  name: string;
  location: string;
  city: string;
}

export default function TheaterManager() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Theater | null>(null);
  const [form, setForm] = useState({ name: "", location: "", city: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTheaters = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/admin/theaters");
      setTheaters(res.data.theaters);
    } catch {
      toast.error("Failed to load theaters");
    }
  }, []);

  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.city)
      return toast.error("Name and City are required");
    setIsLoading(true);
    try {
      if (editing) {
        await api.put(`/api/v1/admin/theaters/${editing._id}`, form);
        toast.success("Theater updated");
      } else {
        await api.post("/api/v1/admin/theaters", form);
        toast.success("Theater created");
      }
      setIsModalOpen(false);
      setForm({ name: "", location: "", city: "" });
      setEditing(null);
      fetchTheaters();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this theater?")) return;
    try {
      await api.delete(`/api/v1/admin/theaters/${id}`);
      toast.success("Theater deleted");
      fetchTheaters();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Manage Theaters</h2>
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

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {theaters.map((t) => (
              <tr key={t._id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                <td className="px-4 py-3 text-slate-400">{t.location}</td>
                <td className="px-4 py-3 text-slate-400">{t.city}</td>
                <td className="px-4 py-3 text-right space-x-2">
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
                    className="text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
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
                {editing ? "Edit Theater" : "Add Theater"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
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
              <input
                type="text"
                placeholder="Theater Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. Mall Name)"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                required
              />
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
