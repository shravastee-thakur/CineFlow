import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, Info, Ticket, ShieldCheck, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/axiosInstance";

interface CheckoutState {
  bookingId: string;
  seats: string[];
  total: number;
  basePrice: number;
  tax: number;
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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as CheckoutState | null;

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Redirect if no data
  useEffect(() => {
    if (!checkoutData) {
      toast.error("No booking data found");
      navigate(-1);
    }
  }, [checkoutData, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeout = async () => {
    try {
      await api.post("/api/v1/payments/unlock-seats", {
        bookingId: checkoutData?.bookingId,
      });
      toast.error("Time expired! Seats released");
      navigate("/");
    } catch {
      toast.error("Failed to release seats");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const handlePayment = async () => {
    if (!checkoutData || !razorpayLoaded) return;

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const { data: orderData } = await api.post(
        "/api/v1/payments/create-order",
        {
          amount: checkoutData.total * 100,
        },
      );

      if (!orderData.success) throw new Error(orderData.message);

      // Open Razorpay
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "CineFlow",
        description: `Booking: ${checkoutData.show.movie.title}`,
        order_id: orderData.data.id,
        handler: async (response: any) => {
          try {
            const { data } = await api.post("/api/v1/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: checkoutData.bookingId,
            });

            if (data.success) {
              toast.success("Booking confirmed! 🎬", {
                style: {
                  borderRadius: "10px",
                  background: "#AAFFC7",
                  color: "#333",
                },
              });
              navigate("/ticket", {
                state: { booking: data.data, seats: checkoutData.seats },
              });
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment failed");
            await api
              .post("/api/v1/payments/unlock-seats", {
                bookingId: checkoutData.bookingId,
              })
              .catch(() => {});
          }
        },
        prefill: {
          // Add user details if available
        },
        theme: { color: "#f59e0b" },
        modal: {
          ondismiss: async () => {
            await api
              .post("/api/v1/payments/unlock-seats", {
                bookingId: checkoutData.bookingId,
              })
              .catch(() => {});
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
      await api
        .post("/api/v1/payments/unlock-seats", {
          bookingId: checkoutData?.bookingId,
        })
        .catch(() => {});
    } finally {
      setIsProcessing(false);
    }
  };

  if (!checkoutData) return null;

  const { date, time } = formatDateTime(checkoutData.show.startTime);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Timer Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-red-600 font-semibold">
            <Clock className="w-4 h-4" />
            <span>Time left: {formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - Booking Details */}
          <div className="flex-1 space-y-4">
            {/* Movie Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex gap-4">
                <img
                  src={checkoutData.show.movie.posterImage?.url}
                  alt={checkoutData.show.movie.title}
                  className="w-[80px] h-[120px] rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">
                    {checkoutData.show.movie.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {checkoutData.show.movie.certification} •{" "}
                    {checkoutData.show.movie.languages?.join(", ")} •{" "}
                    {checkoutData.show.screen.format}
                  </p>
                  <p className="text-sm text-slate-600">
                    {checkoutData.show.theater.name},{" "}
                    {checkoutData.show.theater.location},{" "}
                    {checkoutData.show.theater.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Show Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-base font-medium border-b border-slate-200 pb-4">
                {date} • <span className="font-semibold">{time}</span>
              </p>

              <div className="mt-4">
                <p className="text-base font-semibold">
                  {checkoutData.seats.length} ticket
                  {checkoutData.seats.length > 1 ? "s" : ""}
                </p>
                <div className="text-sm text-slate-600 mt-1">
                  <p className="font-medium">
                    {checkoutData.show.screen.name} -{" "}
                    {checkoutData.seats.join(", ")}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Ticket Price</span>
                  <span className="text-base font-semibold">
                    ₹{checkoutData.basePrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                <span className="font-semibold">No cancellation</span> - Tickets
                cannot be cancelled or refunded after payment
              </p>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
              <p className="font-medium text-sm flex items-center gap-2 text-slate-700">
                <span className="text-amber-500">🎁</span> Available Offers
              </p>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                View all offers
              </button>
            </div>
          </div>

          {/* Right Section - Payment Summary */}
          <div className="w-full lg:w-[350px] space-y-4">
            {/* Payment Summary */}
            <div>
              <h4 className="font-semibold text-slate-900 text-lg mb-3">
                Payment summary
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Order amount</span>
                  <span className="text-slate-900">
                    ₹{checkoutData.basePrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxes & fees (5%)</span>
                  <span className="text-slate-900">₹{checkoutData.tax}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900">To be paid</span>
                    <span className="text-slate-900">
                      ₹{checkoutData.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div>
              <h4 className="font-semibold text-slate-900 text-lg mb-3">
                Your details
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-semibold text-sm">
                    U
                  </span>
                </div>
                <div className="-mt-1">
                  <p className="text-sm font-semibold text-slate-900">User</p>
                  <p className="text-sm text-slate-600">user@example.com</p>
                  <p className="text-sm text-slate-600">
                    {checkoutData.show.theater.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2 cursor-pointer hover:text-slate-900">
                <span className="text-slate-400">ⓘ</span> Terms and conditions
              </p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || timeLeft <= 0}
              className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-2xl px-6 py-4 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">
                  ₹{checkoutData.total}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  TOTAL
                </span>
              </div>
              <span className="text-white font-semibold">
                {isProcessing ? "Processing..." : "Proceed To Pay"}
              </span>
            </button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Payments are secured and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
