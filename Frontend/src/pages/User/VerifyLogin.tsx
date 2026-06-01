import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
} from "react";

const OTP_LENGTH = 6;
const EXPIRY_SECONDS = 300;
const EXPIRY_THRESHOLD = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiryTime, setExpiryTime] = useState(EXPIRY_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isExpiring = expiryTime <= EXPIRY_THRESHOLD;

  useEffect(() => {
    if (expiryTime <= 0) return;
    const timer = setInterval(
      () => setExpiryTime((prev) => Math.max(0, prev - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [expiryTime]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!/^\d*$/.test(raw)) return;

    const newOtp = [...otp];
    newOtp[index] = raw.slice(-1);
    setOtp(newOtp);
    setError("");

    if (raw && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (expiryTime <= 0) {
      setError("Code has expired. Please restart the login flow.");
      return;
    }
    if (code.length < OTP_LENGTH) {
      setError("Enter the complete verification code");
      return;
    }

    setIsLoading(true);
    setError("");
    // Replace with actual API call
    await new Promise((res) => setTimeout(res, 1200));
    setIsLoading(false);
    console.log("Verifying OTP:", code);
    // Redirect or update session on success
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
            className={`mb-6 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg ${
              isExpiring
                ? "bg-orange-950/40 text-orange-400 border border-orange-800/50"
                : "bg-slate-800/50 text-slate-300 border border-slate-700"
            }`}
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

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-semibold rounded-xl border transition-all focus:outline-none ${
                  error
                    ? "bg-red-950/30 border-red-500/50 text-red-300"
                    : "bg-slate-800 border-slate-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                }`}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <p className="mb-4 text-sm text-center text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            onClick={handleVerify}
            disabled={isLoading || expiryTime === 0}
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
}
