import { useNavigate, useLocation } from "react-router-dom";
import { XCircle, Home } from "lucide-react";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMessage =
    location.state?.error || "Your payment could not be processed";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Failure Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <XCircle className="w-12 h-12 text-red-500" />
            <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse"></div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Payment Failed</h1>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>

          <p className="text-slate-400 mb-2">
            Unfortunately, your payment could not be processed.
          </p>
          <p className="text-slate-500 text-sm">
            No charges have been made to your account. Your seats have been
            released.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
