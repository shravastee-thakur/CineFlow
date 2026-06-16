import { useState, useEffect, ChangeEvent, ClipboardEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axiosInstance";

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 300;
const EXPIRY_THRESHOLD = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VerifyOTPPage = () => {
  const { userId, setIsVerified, setUserInfo, setRole } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiryTime, setExpiryTime] = useState(EXPIRY_SECONDS);
  const navigate = useNavigate();

  const isExpiring = expiryTime <= EXPIRY_THRESHOLD;
  const isOtpComplete = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (expiryTime <= 0) return;
    const timer = setInterval(
      () => setExpiryTime((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [expiryTime]);

  useEffect(() => {
    // Auto focus the input on mount
    const input = document.getElementById("otp-input");
    input?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(raw);
    if (error) setError("");
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    setOtp(pasted);
    if (error) setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isOtpComplete) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (expiryTime <= 0) {
      setError("Code has expired. Please restart the login flow.");
      return;
    }
    if (!isOtpComplete) {
      setError(`Enter all ${OTP_LENGTH} digits`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/api/v1/users/verifyLogin", { userId, otp });
      console.log(res);

      if (res.data.success) {
        setIsVerified(res.data.user.isVerified);
        setUserInfo(res.data.user);
        setRole(res.data.user.role);
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#F0E76F", color: "#333" },
        });
        navigate("/");
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">
            Verify your identity
          </h1>
          <p className="text-slate-400 mb-8 text-sm">
            Enter the 6 digit code sent to your email or phone.
          </p>

          {/* Expiry Status Block */}
          <div
            className={`mb-6 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg ${isExpiring ? "bg-orange-950/40 text-orange-400 border border-orange-800/50" : "bg-slate-800/50 text-slate-300 border border-slate-700"}`}
          >
            {isExpiring ? (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : (
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            )}
            <span>Code expires in {formatTime(expiryTime)}</span>
          </div>

          {/* Single OTP Input */}
          <div className="mb-6">
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={handleChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              maxLength={OTP_LENGTH}
              placeholder="000000"
              aria-label="One time password"
              className={`w-full bg-slate-800 text-white text-center text-3xl tracking-[1em] font-semibold rounded-xl px-4 py-4 border transition-all focus:outline-none ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-center text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || expiryTime === 0 || !isOtpComplete}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 mb-4"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : expiryTime === 0 ? (
              "Code Expired"
            ) : (
              "Verify Code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
