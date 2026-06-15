import { useNavigate } from "react-router-dom";
import { Home, Film, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-[120px] sm:text-[160px] font-black leading-none text-slate-800 select-none">
            4<span className="text-amber-500">0</span>4
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
            <Film className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to enjoying great movies.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {/* Extra link */}
        <p className="mt-8 text-sm text-slate-500">
          Looking for something?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Browse all movies
          </button>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
