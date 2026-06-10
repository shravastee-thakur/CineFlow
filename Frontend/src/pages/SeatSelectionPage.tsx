import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Ticket, Clock, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";

interface Seat {
  seatNumber: string;
  seatType: "standard" | "premium" | "recliner" | "empty";
  price: number;
  isBroken: boolean;
}

interface Row {
  rowName: string;
  seats: Seat[];
}

interface Screen {
  _id: string;
  name: string;
  format: string;
  audioType: string;
  layout: Row[];
}

interface Show {
  _id: string;
  movie: {
    _id: string;
    title: string;
    posterImage?: { url: string };
    rating: number;
    duration: number;
  };
  screen: Screen;
  theater: {
    _id: string;
    name: string;
    location: string;
    city: string;
  };
  startTime: string;
  bookedSeats: string[];
}

type SeatStatus = "available" | "selected" | "booked" | "broken" | "empty";

export default function SeatSelectionPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchShow = async () => {
      if (!showId) return;

      setIsLoading(true);
      try {
        const res = await api.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/shows/getShowById/${showId}`,
        );

        if (res.data.success) {
          setShow(res.data.data);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load show");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShow();
  }, [showId, navigate]);

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (seat.seatType === "empty") return "empty";
    if (seat.isBroken) return "broken";
    if (show?.bookedSeats.includes(seat.seatNumber)) return "booked";
    if (selectedSeats.includes(seat.seatNumber)) return "selected";
    return "available";
  };

  const handleSeatToggle = (seatNumber: string) => {
    const seat = show?.screen.layout
      .flatMap((row) => row.seats)
      .find((s) => s.seatNumber === seatNumber);

    // Don't allow selection of empty/broken/booked seats
    if (
      !seat ||
      seat.seatType === "empty" ||
      seat.isBroken ||
      show?.bookedSeats.includes(seatNumber)
    ) {
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber],
    );
  };

  const totalPrice = useMemo(() => {
    const allSeats = show?.screen.layout.flatMap((row) => row.seats) || [];
    return selectedSeats.reduce((sum, seatNum) => {
      const seat = allSeats.find((s) => s.seatNumber === seatNum);
      return sum + (seat?.price || 0);
    }, 0);
  }, [selectedSeats, show]);

  const handleProceed = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/createBooking`,
        {
          showId,
          seats: selectedSeats,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
        });
        navigate("/payment", {
          state: {
            bookingId: res.data.data._id,
            seats: selectedSeats,
            total: totalPrice,
            show,
          },
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to lock seats", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Extract just the number part from seatNumber (e.g., "J20" → "20")
  const getSeatDisplayNumber = (seatNumber: string) => {
    return seatNumber.replace(/^[A-Z]+/, "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-slate-900 rounded w-1/3 mb-6" />
          <div className="bg-slate-900 rounded-2xl p-6 mb-6">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
            <div className="flex gap-4">
              <div className="h-20 w-16 bg-slate-800 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6">
            <div className="h-32 bg-slate-800 rounded mb-6" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 bg-slate-800 rounded w-6" />
                  <div className="flex gap-2">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="h-10 w-10 bg-slate-800 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Show Info Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={show.movie.posterImage?.url}
              alt={show.movie.title}
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white mb-1 truncate">
                {show.movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(show.movie.duration / 60)}h{" "}
                  {show.movie.duration % 60}m
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">
                    {(show.movie.rating * 2).toFixed(1)}
                  </span>
                </div>
                <span>•</span>
                <span className="text-amber-400">{show.screen.format}</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {formatTime(show.startTime)} • {show.screen.name}
              </p>
            </div>
          </div>
        </div>

        {/* Screen Visualization */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-md h-2 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-slate-400">SCREEN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-700 border border-green-600" />
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 border border-amber-400" />
            <span className="text-slate-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-600 border border-slate-500" />
            <span className="text-slate-400">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-500/20 border border-red-500/50" />
            <span className="text-slate-400">Broken</span>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 mb-6 overflow-x-auto">
          <div className="min-w-max mx-auto">
            {show.screen.layout.map((row) => (
              <div
                key={row.rowName}
                className="flex items-center mb-3 last:mb-0"
              >
                {/* Row Label */}
                <div className="w-8 text-right pr-3 text-sm font-medium text-slate-400">
                  {row.rowName}
                </div>

                {/* Seats */}
                <div className="flex gap-1 md:gap-1.5">
                  {row.seats.map((seat) => {
                    const status = getSeatStatus(seat);

                    // Render gap/aisle as visual spacer
                    if (status === "empty") {
                      return (
                        <div
                          key={seat.seatNumber}
                          className="w-8 h-8 md:w-10 md:h-10"
                          title="Aisle"
                        />
                      );
                    }

                    return (
                      <button
                        key={seat.seatNumber}
                        onClick={() => handleSeatToggle(seat.seatNumber)}
                        disabled={status === "booked" || status === "broken"}
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed ${
                          status === "available"
                            ? "bg-slate-700 border-green-600 hover:bg-slate-600 hover:border-amber-500/50 text-slate-200"
                            : status === "selected"
                              ? "bg-amber-500 border-amber-400 text-slate-950 font-semibold"
                              : status === "booked"
                                ? "bg-slate-600 border-slate-500 text-slate-400"
                                : "bg-red-500/20 border-red-500/50 text-red-400"
                        }`}
                        title={`${seat.seatNumber} • ₹${seat.price} • ${seat.seatType}`}
                      >
                        {getSeatDisplayNumber(seat.seatNumber)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 md:static md:border md:rounded-2xl md:mb-6 z-20">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Selected Seats</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm rounded-lg border border-amber-500/30"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-xl font-bold text-white">₹{totalPrice}</p>
                </div>
                <button
                  onClick={handleProceed}
                  disabled={isSubmitting || selectedSeats.length === 0}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  {isSubmitting ? "Locking..." : "Proceed"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
