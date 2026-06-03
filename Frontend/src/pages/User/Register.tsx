import { useState, SyntheticEvent, ChangeEvent } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/axiosInstance";

interface FormState {
  name: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isInvalid = (field: keyof FormState) =>
    touched[field] && !form[field].trim();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof FormState] && value) {
      setTouched((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    if (!form[field].trim()) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`,
        form,
      );
      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
        });
        navigate("/login");
      }
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses =
    "w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none transition-all";

  const getBorderClasses = (field: keyof FormState) =>
    isInvalid(field)
      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <button
        onClick={() => navigate("/")}
        aria-label="Back to home"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">
            Create your CineFlow account
          </h1>
          <p className="text-slate-400 mb-8 text-sm">
            Unlock early access and exclusive screenings.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur("name")}
                className={`${inputBaseClasses} border ${getBorderClasses("name")}`}
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                className={`${inputBaseClasses} border ${getBorderClasses("email")}`}
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  className={`${inputBaseClasses} border ${getBorderClasses("password")} pr-11`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-semibold py-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
