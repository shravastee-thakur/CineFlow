import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { CheckCircle, Ticket, Download, Home } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axiosInstance";

interface BookingData {
  bookingId: string;
  seats: string[];
  totalPrice: number;
  showTime: string;
  movieTitle: string;
  moviePoster: string;
  screenName: string;
  theaterName: string;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { bookingId } = useParams<{ bookingId: string }>();
  const { isVerified } = useAuthStore();

  const sessionId = searchParams.get("session_id");
  const called = useRef(false);
  const [bookingDetails, setBookingDetails] = useState<BookingData | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (sessionId && bookingId && isVerified && !called.current) {
      called.current = true;

      const verifyAndFetch = async () => {
        try {
          // Verify payment
          const verifyRes = await api.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/verifyPayment`,
            {
              sessionId,
            },
          );

          if (verifyRes.data.success) {
            const bookingRes = await api.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/getBookingByCustomId/${bookingId}`,
            );
            setBookingDetails(bookingRes.data.data);
            setIsVerifying(false);

            toast.success("Payment verified successfully!", {
              style: {
                borderRadius: "10px",
                background: "#AAFFC7",
                color: "#333",
              },
            });
          } else {
            toast.error("Payment verification failed");
            navigate("/payment-failure");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Failed to verify payment");
          navigate("/payment-failure");
        }
      };

      verifyAndFetch();
    }
  }, [sessionId, bookingId, isVerified, navigate]);

  useEffect(() => {
    if (!isVerifying && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate("/profile");
    }
  }, [countdown, isVerifying, navigate]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Verifying Payment...
          </h1>
          <p className="text-slate-400">
            Please wait while we confirm your booking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-slate-400">
              Your booking has been confirmed. Redirecting to your bookings in{" "}
              <span className="text-amber-400 font-semibold">{countdown}s</span>
            </p>
          </div>

          {/* Booking Details */}
          {bookingDetails && (
            <div className="border-t border-slate-800 pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={bookingDetails.moviePoster}
                    alt={bookingDetails.movieTitle}
                    className="w-full md:w-32 h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Booking Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {bookingDetails.movieTitle}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Booking ID:{" "}
                      <span className="text-amber-400">
                        {bookingDetails.bookingId}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">
                        Date & Time
                      </p>
                      <p className="text-white font-medium">
                        {formatDate(bookingDetails.showTime)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {formatTime(bookingDetails.showTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">
                        Venue
                      </p>
                      <p className="text-white font-medium">
                        {bookingDetails.theaterName}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {bookingDetails.screenName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-slate-500 text-xs uppercase tracking-wide">
                      Seats:
                    </p>
                    {bookingDetails.seats.map((seat, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm rounded-lg border border-amber-500/30 font-medium"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wide">
                        Total Paid
                      </p>
                      <p className="text-2xl font-bold text-amber-400">
                        ₹{bookingDetails.totalPrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Ticket className="w-5 h-5" />
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
