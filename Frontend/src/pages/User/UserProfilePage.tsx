import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axiosInstance";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import PersonalInfo from "../../components/profile/PersonalInfo";
import SecuritySettings from "../../components/profile/SecuritySettings";
import BookingHistory from "../../components/profile/BookingHistory";
import PaymentMethods from "../../components/profile/PaymentMethods";
import Preferences from "../../components/profile/Preferences";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  memberSince: string;
  avatar?: string;
  preferences: {
    defaultLocation: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

interface Booking {
  _id: string;
  movieTitle: string;
  theater: string;
  date: string;
  time: string;
  seats: string[];
  status: "upcoming" | "completed" | "cancelled";
  qrCode?: string;
}

interface PaymentMethod {
  _id: string;
  type: "card" | "upi";
  last4?: string;
  upiId?: string;
  isDefault: boolean;
  expiry?: string;
}

export type ProfileSection =
  | "personal"
  | "security"
  | "bookings"
  | "payments"
  | "preferences";

export default function UserProfilePage() {
  const { userId, userInfo, isVerified, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isVerified) navigate("/login");
  }, [isVerified, navigate]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [profileRes, bookingsRes, paymentsRes] = await Promise.all([
        api.get(`/api/v1/users/${userId}/profile`),
        api.get(`/api/v1/users/${userId}/bookings?limit=5`),
        api.get(`/api/v1/users/${userId}/payment-methods`),
      ]);
      setProfile(profileRes.data.user);
      setBookings(bookingsRes.data.bookings);
      setPaymentMethods(paymentsRes.data.methods);
      // Sync with global store if needed
      // if (setUser) setUser(profileRes.data.user);
    } catch {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch {
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const handleProfileUpdate = async (data: Partial<UserProfile>) => {
    if (!userId) return;
    try {
      const res = await api.patch(`/api/v1/users/${userId}/profile`, data);
      setProfile(res.data.user);
      toast.success("Profile updated", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
      return true;
    } catch {
      toast.error("Update failed", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      return false;
    }
  };

  const handlePreferencesUpdate = async (prefs: UserProfile["preferences"]) => {
    if (!userId) return;
    try {
      await api.patch(`/api/v1/users/${userId}/preferences`, {
        preferences: prefs,
      });
      setProfile((prev) => (prev ? { ...prev, preferences: prefs } : prev));
      toast.success("Preferences updated", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
      return true;
    } catch {
      toast.error("Failed to update", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      return false;
    }
  };

  const handleSetDefaultPayment = async (methodId: string) => {
    if (!userId) return;
    try {
      await api.post(
        `/api/v1/users/${userId}/payment-methods/${methodId}/default`,
      );
      setPaymentMethods((methods) =>
        methods.map((m) => ({ ...m, isDefault: m._id === methodId })),
      );
      toast.success("Default updated", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
      return true;
    } catch {
      toast.error("Failed", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="lg:col-span-3 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
                >
                  <div className="h-6 bg-slate-800 rounded w-1/4 mb-4" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="h-4 bg-slate-800 rounded w-full"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            profile={profile}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <main className="lg:col-span-3 space-y-6">
            {/* {activeSection === "personal" && (
              <PersonalInfo
                userInfo={userInfo}
                profile={profile}
                onSave={handleProfileUpdate}
              />
            )} */}
            {activeSection === "security" && <SecuritySettings />}
            {activeSection === "bookings" && (
              <BookingHistory
                bookings={bookings}
                onViewAll={() => navigate("/bookings")}
              />
            )}
            {/* {activeSection === "payments" && (
              <PaymentMethods
                methods={paymentMethods}
                onSetDefault={handleSetDefaultPayment}
              />
            )} */}
            {/* {activeSection === "preferences" && (
              // <Preferences
              //   preferences={profile?.preferences}
              //   onSave={handlePreferencesUpdate}
              // />
            )} */}
          </main>
        </div>
      </div>
    </div>
  );
}
