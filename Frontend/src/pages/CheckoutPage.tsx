import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Clock, Ticket, ShieldCheck, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const formatShowTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const getRemainingTime = (createdAt: string): number => {
  const expiryTime = new Date(createdAt).getTime() + LOCK_DURATION_MS;
  const remainingMs = expiryTime - Date.now();
  return Math.max(0, Math.floor(remainingMs / 1000));
};

interface CheckoutState {
  bookingId: string;
  createdAt: string;
  seats: string[];
  total: number;
  show: {
    _id: string;
    movie: {
      _id: string;
      title: string;
      posterImage?: { url: string };
      duration: number;
      certification?: string;
      languages?: string[];
    };
    screen: {
      _id: string;
      name: string;
      format: string;
    };
    theater: {
      _id: string;
      name: string;
      location: string;
      city: string;
    };
    startTime: string;
  };
}

const CheckoutPage = () => {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const checkoutData = location.state as CheckoutState | null;

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!checkoutData?.createdAt) return 0;
    return getRemainingTime(checkoutData.createdAt);
  });
  const [isExpired, setIsExpired] = useState(timeLeft === 0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!checkoutData) {
      toast.error("No booking data found. Please select seats first.");
      navigate(-1);
    }
  }, [checkoutData, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft <= 0]);

  useEffect(() => {
    if (timeLeft !== 0 || !checkoutData) return;

    const isMounted = { current: true };

    const handleTimeout = async () => {
      setIsExpired(true);

      try {
        await api.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/updateBookingStatus/${checkoutData.bookingId}`,
          { status: "failed" },
        );
        if (isMounted.current) {
          toast.error("Time expired! Your seats have been released.");
          navigate("/");
        }
      } catch (err) {
        console.error("Timeout error:", err);
        if (isMounted.current) {
          toast.error("Failed to release seats. Please contact support.");
        }
      }
    };

    handleTimeout();

    return () => {
      isMounted.current = false;
    };
  }, [timeLeft, checkoutData, navigate]);

  const handleCancel = async () => {
    if (!checkoutData) {
      navigate(-1);
      return;
    }

    try {
      const res = await api.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/updateBookingStatus/${checkoutData.bookingId}`,
        {
          status: "cancelled",
        },
      );
      console.log(res);

      if (res.data.success) {
        toast.success("Booking cancelled! Your seats have been released.", {
          style: { borderRadius: "10px", background: "#F0E76F", color: "#333" },
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to lock seats", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    } finally {
      navigate(-1);
    }
  };
  console.log(checkoutData);

  const handleProceedToPayment = async () => {
    if (!checkoutData || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/payment`,
        { userId, bookingId: checkoutData.bookingId },
      );
      console.log(res);
      if (res.data.success) {
        const checkoutUrl = res.data.data.url;
        window.location.href = checkoutUrl;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message, {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      setIsProcessing(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div
          className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 font-medium">
            {isExpired ? (
              "Time expired. Seats have been released."
            ) : (
              <>
                Seats locked for{" "}
                <span className="font-bold">{formatTime(timeLeft)}</span> •
                Complete payment to confirm
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-start gap-4">
                <img
                  src={checkoutData.show.movie.posterImage?.url}
                  alt={checkoutData.show.movie.title}
                  className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-white mb-1 truncate">
                    {checkoutData.show.movie.title}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {checkoutData.show.screen.format}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">
                    {formatDate(checkoutData.show.startTime)} •{" "}
                    {formatShowTime(checkoutData.show.startTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Selected Seats
              </h2>
              <div className="flex flex-wrap gap-2">
                {checkoutData.seats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-sm rounded-lg border border-amber-500/30 font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {checkoutData.seats.length} ticket
                {checkoutData.seats.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                <span className="font-medium text-amber-400">No refunds:</span>{" "}
                Tickets cannot be cancelled or refunded after payment is
                completed.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Payment Summary
              </h2>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="text-2xl font-bold text-amber-400">
                    ₹{checkoutData.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={isExpired || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <Ticket className="w-5 h-5" />
                {isExpired
                  ? "Expired"
                  : isProcessing
                    ? "Processing..."
                    : "Proceed to Payment"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Secured checkout</span>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                You will be redirected to payment gateway after clicking above
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
