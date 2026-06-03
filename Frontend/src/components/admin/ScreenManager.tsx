import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

interface Seat {
  seatNumber: string;
  seatType: "standard" | "premium";
  price: number;
  isBroken: boolean;
}
interface Row {
  rowName: string;
  seats: Seat[];
}
interface Screen {
  _id: string;
  theater: string;
  name: string;
  format: string;
  audioType: string;
  layout: Row[];
}

export default function ScreenManager() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theaters, setTheaters] = useState<{ _id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Screen | null>(null);
  const [form, setForm] = useState<Partial<Screen>>({
    theater: "",
    name: "",
    format: "",
    audioType: "",
    layout: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [screensRes, theatersRes] = await Promise.all([
        api.get("/api/v1/admin/screens"),
        api.get("/api/v1/admin/theaters"),
      ]);
      setScreens(screensRes.data.screens);
      setTheaters(theatersRes.data.theaters);
    } catch {
      toast.error("Failed to load data");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addRow = () => {
    const nextChar = String.fromCharCode(65 + (form.layout?.length || 0));
    setForm((prev) => ({
      ...prev,
      layout: [...(prev.layout || []), { rowName: nextChar, seats: [] }],
    }));
  };

  const addSeat = (rowIndex: number) => {
    const layout = [...(form.layout || [])];
    const row = layout[rowIndex];
    const nextNum = row.seats.length + 1;
    row.seats.push({
      seatNumber: `${row.rowName}${nextNum}`,
      seatType: "standard",
      price: 250,
      isBroken: false,
    });
    setForm({ ...form, layout });
  };

  const updateSeat = (
    rIdx: number,
    sIdx: number,
    field: keyof Seat,
    value: any,
  ) => {
    const layout = [...(form.layout || [])];
    layout[rIdx].seats[sIdx] = { ...layout[rIdx].seats[sIdx], [field]: value };
    setForm({ ...form, layout });
  };

  const removeRow = (idx: number) => {
    const layout = [...(form.layout || [])];
    layout.splice(idx, 1);
    setForm({ ...form, layout });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.theater || !form.name)
      return toast.error("Theater and Name are required");
    setIsLoading(true);
    try {
      if (editing) await api.put(`/api/v1/admin/screens/${editing._id}`, form);
      else await api.post("/api/v1/admin/screens", form);
      toast.success(editing ? "Screen updated" : "Screen created");
      setIsModalOpen(false);
      setForm({ theater: "", name: "", format: "", audioType: "", layout: [] });
      setEditing(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this screen?")) return;
    try {
      await api.delete(`/api/v1/admin/screens/${id}`);
      toast.success("Screen deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Manage Screens</h2>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              theater: "",
              name: "",
              format: "",
              audioType: "",
              layout: [],
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
        >
          + Add Screen
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-300">
            <tr>
              <th className="px-4 py-3">Screen</th>
              <th className="px-4 py-3">Theater</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {screens.map((s) => (
              <tr key={s._id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-white">{s.name}</td>
                <td className="px-4 py-3 text-slate-400">{s.theater}</td>
                <td className="px-4 py-3 text-slate-400">{s.format}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(s);
                      setForm(s);
                      setIsModalOpen(true);
                    }}
                    className="text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s._id)}
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
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-semibold text-white">
                {editing ? "Edit Screen" : "Add Screen"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Theater *
                  </label>
                  <select
                    value={form.theater}
                    onChange={(e) =>
                      setForm({ ...form, theater: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">Select Theater</option>
                    {theaters.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Screen Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Format
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) =>
                      setForm({ ...form, format: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Select Format</option>
                    {["IMAX", "2D", "3D", "4DX", "Dolby"].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Audio Type
                  </label>
                  <input
                    type="text"
                    value={form.audioType}
                    onChange={(e) =>
                      setForm({ ...form, audioType: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. Dolby Atmos"
                  />
                </div>
              </div>

              {/* Seat Layout Builder */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Seat Layout
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {form.layout?.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          Row {row.rowName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addSeat(rIdx)}
                            className="text-xs text-amber-400 hover:text-amber-300"
                          >
                            + Seat
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(rIdx)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.seats.map((seat, sIdx) => (
                          <div
                            key={sIdx}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${seat.isBroken ? "bg-red-500/10 border-red-500/30 text-red-400" : seat.seatType === "premium" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-700 border-slate-600 text-slate-300"}`}
                          >
                            <span>{seat.seatNumber}</span>
                            <input
                              type="number"
                              value={seat.price}
                              onChange={(e) =>
                                updateSeat(
                                  rIdx,
                                  sIdx,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              className="w-12 bg-transparent border-b border-slate-600 focus:border-amber-500 outline-none text-right"
                            />
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={seat.isBroken}
                                onChange={(e) =>
                                  updateSeat(
                                    rIdx,
                                    sIdx,
                                    "isBroken",
                                    e.target.checked,
                                  )
                                }
                                className="rounded bg-slate-700 border-slate-600"
                              />
                              <span className="text-[10px]">Broken</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
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
