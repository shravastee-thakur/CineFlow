import { useState, SyntheticEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const showRedBorder = isEmailTouched && !email.trim();

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setIsEmailTouched(true);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear touched state when user starts typing again
    if (isEmailTouched && e.target.value) {
      setIsEmailTouched(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setIsEmailTouched(true); // Ensure validation triggers on submit

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/forgot-password`,
        { email },
      );
      console.log(res);

      if (res.data.success) {
        setIsSubmitted(true);
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#F0E76F", color: "#333" },
        });
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10">
        {!isSubmitted ? (
          /* REQUEST STATE */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Forgot password?
              </h1>
              <p className="text-slate-400 text-sm">
                Enter your email and we will send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl py-2.5 px-4 border transition-all focus:outline-none ${
                      showRedBorder
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-semibold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {isLoading ? (
                  <>
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>Back to Sign In</span>
              </Link>
            </div>
          </>
        ) : (
          /* SUCCESS STATE */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Check your email
              </h1>
              <p className="text-slate-400 text-sm">
                We sent password reset instructions to
              </p>
              <p className="text-amber-400 font-medium text-sm mt-1 break-all">
                {email}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-5 mb-8 border border-slate-700">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Check your inbox for the reset email</li>
                  <li>Click the link to create a new password</li>
                  <li>Link expires in 15 min for security</li>
                  <li>Check spam folder if you do not see it</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 text-center mt-6">
              <p className="text-sm text-slate-500">
                You can safely close this tab and continue in the window opened
                by your email link.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
