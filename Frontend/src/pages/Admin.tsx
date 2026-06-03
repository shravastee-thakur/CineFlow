import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import MovieManager from "../components/admin/MovieManager";
import TheaterManager from "../components/admin/TheaterManager";
import ScreenManager from "../components/admin/ScreenManager";
import ShowManager from "../components/admin/ShowManager";

type AdminTab = "movies" | "theaters" | "screens" | "shows";

export default function AdminPage() {
  const { role, isVerified, userInfo } = useAuthStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("movies");

  useEffect(() => {
    if (!isVerified || role !== "admin") {
      navigate("/");
    }
  }, [isVerified, role, navigate]);

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "movies", label: "Movies" },
    { id: "theaters", label: "Theaters" },
    { id: "screens", label: "Screens" },
    { id: "shows", label: "Shows" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <span className="text-sm text-slate-400">
            Welcome, {userInfo?.username}
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "movies" && <MovieManager />}
        {activeTab === "theaters" && <TheaterManager />}
        {activeTab === "screens" && <ScreenManager />}
        {activeTab === "shows" && <ShowManager />}
      </main>
    </div>
  );
}
