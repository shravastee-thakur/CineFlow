import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2, Plus, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";
import { useShowStore } from "../../store/showStore";

// Interfaces must exactly match backend enums
interface Seat {
  seatNumber: string;
  seatType: "standard" | "premium" | "recliner";
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
  format: "2D" | "3D" | "IMAX" | "4DX";
  audioType: "Standard" | "7.1 Surround" | "Dolby Atmos";
  layout: Row[];
  isDeleted?: boolean;
}

interface TheaterOption {
  _id: string;
  name: string;
}

export default function ScreenManager() {
  const { selectedTheaterId, setSelectedTheater } = useShowStore();

  const [screens, setScreens] = useState<Screen[]>([]);
  const [theaters, setTheaters] = useState<TheaterOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Screen | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [form, setForm] = useState<Partial<Screen>>({
    theater: selectedTheaterId || "",
    name: "",
    format: "2D",
    audioType: "Standard",
    layout: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchTheaters = useCallback(async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/theaters/getAllTheatersAdmin?page=1&limit=100`,
      );

      const theatersData = res.data.data.theater;
      setTheaters(theatersData);

      // Auto-select first theater if none selected
      if (!selectedTheaterId && theatersData.length > 0) {
        setSelectedTheater(theatersData[0]._id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load theaters");
    }
  }, [selectedTheaterId, setSelectedTheater]);

  const fetchScreens = useCallback(async () => {
    if (!selectedTheaterId) return;

    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/screens/getScreensByTheaterAdmin/${selectedTheaterId}`,
      );
      console.log("Screen", res);

      const screensData = res.data.data || [];
      setScreens(screensData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load screens");
    }
  }, [selectedTheaterId, showDeleted]);

  const fetchData = useCallback(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedTheaterId) {
      fetchScreens();
    }
  }, [selectedTheaterId, fetchScreens]);

  // Sync form theater when store changes
  useEffect(() => {
    if (selectedTheaterId) {
      setForm((prev) => ({ ...prev, theater: selectedTheaterId }));
    }
  }, [selectedTheaterId]);

  // Form handlers
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

  const removeSeat = (rIdx: number, sIdx: number) => {
    const layout = [...(form.layout || [])];
    layout[rIdx].seats.splice(sIdx, 1);
    setForm({ ...form, layout });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.theater || !form.name) {
      return toast.error("Theater and Screen Name are required");
    }

    if (!form.layout || form.layout.length === 0) {
      return toast.error("At least one row with seats is required");
    }

    for (const row of form.layout) {
      if (!row.seats || row.seats.length === 0) {
        return toast.error(`Row ${row.rowName} must have at least one seat`);
      }
    }

    setIsLoading(true);
    try {
      if (editing) {
        const res = await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/screens/updateScreen//${editing._id}`,
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
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/screens/createScreen`,
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
      setForm({
        theater: selectedTheaterId || "",
        name: "",
        format: "2D",
        audioType: "Standard",
        layout: [],
      });
      setEditing(null);
      fetchScreens();
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
    if (
      !confirm(
        "Soft delete this screen? It will be hidden from users but can still be viewed here.",
      )
    )
      return;

    try {
      const res = await api.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/screens/deleteScreen/${id}`,
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
      fetchScreens();
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

  // Filter screens based on toggle
  const filteredScreens = screens.filter((s) =>
    showDeleted ? !!s.isDeleted : !s.isDeleted,
  );

  const selectedTheater = theaters.find((t) => t._id === selectedTheaterId);

  return (
    <div className="space-y-6">
      {/* Header with Theater Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Manage Screens</h2>
          <select
            value={selectedTheaterId || ""}
            onChange={(e) => setSelectedTheater(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value="">Select Theater</option>
            {theaters.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTheater && (
            <span className="text-sm text-slate-400">
              Managing:{" "}
              <span className="text-white font-medium">
                {selectedTheater.name}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle to show/hide deleted screens */}
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          >
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>

          <button
            onClick={() => {
              if (!selectedTheaterId) {
                return toast.error("Please select a theater first");
              }
              setEditing(null);
              setForm({
                theater: selectedTheaterId,
                name: "",
                format: "2D",
                audioType: "Standard",
                layout: [],
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition-colors"
          >
            + Add Screen
          </button>
        </div>
      </div>

      {/* No theater selected state */}
      {!selectedTheaterId && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400 mb-4">
            Select a theater from the dropdown above to manage its screens.
          </p>
        </div>
      )}

      {/* Info banner when showing deleted items */}
      {showDeleted && selectedTheaterId && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-200">
            <p className="font-medium">Showing deleted screens</p>
            <p className="text-amber-300/80">
              Deleted screens are hidden from public view and cannot be edited.
              They are displayed for reference only.
            </p>
          </div>
        </div>
      )}

      {/* Screens Table */}
      {selectedTheaterId && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-300">
              <tr>
                <th className="px-4 py-3">Screen</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Audio</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredScreens.map((s) => (
                <tr
                  key={s._id}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    s.isDeleted ? "bg-slate-900/50" : ""
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-medium ${s.isDeleted ? "text-slate-500 line-through" : "text-white"}`}
                  >
                    {s.name}
                  </td>
                  <td
                    className={`px-4 py-3 ${s.isDeleted ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {s.format}
                  </td>
                  <td
                    className={`px-4 py-3 ${s.isDeleted ? "text-slate-600" : "text-slate-400"}`}
                  >
                    {s.audioType}
                  </td>
                  <td className="px-4 py-3">
                    {s.isDeleted ? (
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
                    {s.isDeleted ? (
                      // Deleted screens: NO ACTIONS - read only
                      <span className="text-xs text-slate-500 italic">
                        Read-only
                      </span>
                    ) : (
                      // Active screens: Edit and Soft Delete
                      <>
                        <button
                          onClick={() => {
                            setEditing(s);
                            setForm({
                              theater: s.theater,
                              name: s.name,
                              format: s.format,
                              audioType: s.audioType,
                              layout: s.layout,
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                          title="Edit screen"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-slate-400 hover:text-red-400 transition-colors p-1"
                          title="Soft delete screen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {filteredScreens.length === 0 && selectedTheaterId && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="text-slate-500">
                      <p className="text-lg font-medium mb-1">
                        {showDeleted
                          ? "No deleted screens found"
                          : "No active screens found"}
                      </p>
                      <p className="text-sm">
                        {showDeleted
                          ? "All screens for this theater are currently active."
                          : "Add your first screen to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && selectedTheaterId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-semibold text-white">
                {editing ? "Edit Screen" : "Add Screen"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Theater
                  </label>
                  <div className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-400">
                    {selectedTheater?.name || "Selected"}
                  </div>
                  <input
                    type="hidden"
                    name="theater"
                    value={selectedTheaterId || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Screen Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                    placeholder="e.g. Audi 1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Format *
                  </label>
                  <select
                    value={form.format}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        format: e.target.value as Screen["format"],
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select Format</option>
                    {["2D", "3D", "IMAX", "4DX"].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Audio Type *
                  </label>
                  <select
                    value={form.audioType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        audioType: e.target.value as Screen["audioType"],
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select Audio</option>
                    {["Standard", "7.1 Surround", "Dolby Atmos"].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seat Layout Builder */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-300">
                    Seat Layout *
                  </label>
                  <button
                    type="button"
                    onClick={addRow}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {form.layout?.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">
                          Row {row.rowName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addSeat(rIdx)}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Seat
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(rIdx)}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Remove Row
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {row.seats.map((seat, sIdx) => (
                          <div
                            key={sIdx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors ${
                              seat.isBroken
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : seat.seatType === "recliner"
                                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                  : seat.seatType === "premium"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                    : "bg-slate-700 border-slate-600 text-slate-300"
                            }`}
                          >
                            <span className="font-medium">
                              {seat.seatNumber}
                            </span>
                            <select
                              value={seat.seatType}
                              onChange={(e) =>
                                updateSeat(
                                  rIdx,
                                  sIdx,
                                  "seatType",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent border-b border-slate-600 focus:border-amber-500 outline-none text-right text-xs py-0.5"
                            >
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="recliner">Recliner</option>
                            </select>
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
                              className="w-14 bg-transparent border-b border-slate-600 focus:border-amber-500 outline-none text-right text-xs py-0.5"
                              min="0"
                            />
                            <label className="flex items-center gap-1 cursor-pointer hover:opacity-80">
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
                                className="rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-amber-500/20"
                              />
                              <span className="text-[10px]">Broken</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeSeat(rIdx, sIdx)}
                              className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                              title="Remove seat"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {row.seats.length === 0 && (
                        <p className="text-xs text-slate-500 italic mt-2">
                          No seats in this row. Click "Add Seat" to begin.
                        </p>
                      )}
                    </div>
                  ))}
                  {(!form.layout || form.layout.length === 0) && (
                    <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                      <p className="text-sm mb-2">No rows added yet</p>
                      <button
                        type="button"
                        onClick={addRow}
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                      >
                        + Add your first row
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
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
                  {isLoading
                    ? "Saving..."
                    : editing
                      ? "Update Screen"
                      : "Create Screen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
