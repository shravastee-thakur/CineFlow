import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   CardElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
import { ChevronLeft, Ticket, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";

// Initialize Stripe (replace with your public key)
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface BookingState {
  bookingId: string;
  seats: string[];
  total: number;
  show: {
    _id: string;
    movie: {
      _id: string;
      title: string;
      posterImage?: { url: string };
      duration: number;
    };
    screen: {
      name: string;
      format: string;
    };
    theater: {
      name: string;
      location: string;
      city: string;
    };
    startTime: string;
  };
}

function PaymentForm({ booking }: { booking: BookingState }) {
//   const stripe = useStripe();
//   const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!stripe || !elements) return;

    setIsProcessing(true);
    setCardError(null);

    try {
      // 1. Create PaymentIntent on backend
      const { data: intentData } = await api.post(
        "/api/v1/payments/create-intent",
        {
          bookingId: booking.bookingId,
          amount: booking.total * 100, // Convert to paise/cents
          currency: "inr",
        },
      );

      // 2. Confirm card payment with Stripe
    //   const { error, paymentIntent } = await stripe.confirmCardPayment(
    //     intentData.clientSecret,
    //     {
    //       payment_method: {
    //         card: elements.getElement(CardElement)!,
    //       },
    //     },
    //   );

    //   if (error) {
    //     setCardError(error.message || "Payment failed");
    //     toast.error("Payment failed. Please try again.", {
    //       style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
    //     });
    //     // Unlock seats on payment failure
    //     await api.post(`/api/v1/bookings/${booking.bookingId}/unlock`);
    //     return;
    //   }

    //   if (paymentIntent?.status === "succeeded") {
    //     // 3. Confirm booking on backend
    //     const { data: confirmData } = await api.post(
    //       `/api/v1/bookings/${booking.bookingId}/confirm`,
    //     );

    //     toast.success("Booking confirmed! 🎬", {
    //       style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
    //     });

    //     // 4. Navigate to ticket/confirmation page
    //     navigate("/ticket", {
    //       state: {
    //         booking: confirmData.data,
    //         seats: booking.seats,
    //       },
    //     });
    //   }
    } catch (err: any) {
      setCardError("An unexpected error occurred");
      toast.error(err.response?.data?.message || "Payment failed", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      // Unlock seats on error
      await api
        .post(`/api/v1/bookings/${booking.bookingId}/unlock`)
        .catch(() => {});
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Card Details
        </label>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          {/* <CardElement
            options={{
              style: {
                base: {
                  color: "#fff",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "16px",
                  "::placeholder": { color: "#94a3b8" },
                },
                invalid: { color: "#f87171" },
              },
            }}
            onChange={(e) => {
              if (e.error) setCardError(e.error.message);
              else setCardError(null);
            }}
          /> */}
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            {cardError}
          </p>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Lock className="w-4 h-4" />
        <span>
          Payments are secured by Stripe. We never store your card details.
        </span>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        // disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Ticket className="w-5 h-5" />
            Pay ₹{booking.total.toLocaleString("en-IN")}
          </>
        )}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state as BookingState | null;

  // Redirect if no booking data
  useEffect(() => {
    if (!booking) {
      toast.error("No booking found. Please select seats first.");
      navigate(-1);
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="flex items-start gap-4">
                <img
                  src={booking.show.movie.posterImage?.url}
                  alt={booking.show.movie.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">
                    {booking.show.movie.title}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {Math.floor(booking.show.movie.duration / 60)}h{" "}
                    {booking.show.movie.duration % 60}m •{" "}
                    {booking.show.screen.format}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-slate-300">
                    <span>{formatTime(booking.show.startTime)}</span>
                    <span>•</span>
                    <span>{booking.show.screen.name}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {booking.show.theater.name}, {booking.show.theater.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Selected Seats
              </h2>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-sm rounded-lg border border-amber-500/30 font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Payment Details
              </h2>
              {/* <Elements stripe={stripePromise}>
                <PaymentForm booking={booking} />
              </Elements> */}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Tickets ({booking.seats.length})
                  </span>
                  <span className="text-white">
                    ₹{booking.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Convenience Fee</span>
                  <span className="text-white">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GST (18%)</span>
                  <span className="text-white">Included</span>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-amber-400 text-lg">
                      ₹{booking.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Ticket className="w-4 h-4" />
                  <span>Instant Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
