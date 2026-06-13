import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axiosInstance";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import PersonalInfo from "../../components/profile/PersonalInfo";
import BookingHistory, {
  Booking,
} from "../../components/profile/BookingHistory";

export type ProfileSection = "personal" | "bookings";

export default function UserProfilePage() {
  const { userInfo, isVerified, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isVerified) navigate("/login");
  }, [isVerified, navigate]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/getMyBookings?page=1&limit=100`,
      );
      if (res.data.success) {
        setBookings(res.data.data.bookings);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch {
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ProfileSidebar
            userInfo={userInfo}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <main className="lg:col-span-3 space-y-6">
            {activeSection === "personal" && (
              <PersonalInfo userInfo={userInfo} />
            )}
            {activeSection === "bookings" && (
              <BookingHistory bookings={bookings} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
