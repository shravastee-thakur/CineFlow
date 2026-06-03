import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import api from "../../utils/axiosInstance";

// Types
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

type ProfileSection =
  | "personal"
  | "security"
  | "bookings"
  | "payments"
  | "preferences";

export default function UserProfilePage() {
  const { userId, userInfo, isVerified, clearAuth } = useAuthStore();
  console.log(userInfo);

  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isVerified) {
      navigate("/login");
    }
  }, [isVerified, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
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
        setEditForm(profileRes.data.user);
      } catch (err) {
        toast.error("Failed to load profile data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/users/logout");
    } catch {
      // Always clear client state even if backend fails
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      const res = await api.patch(`/api/v1/users/${userId}/profile`, editForm);
      setProfile(res.data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
    } catch {
      toast.error("Failed to update profile", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    }
  };

  const handleToggleNotification = async (
    field: "emailNotifications" | "smsNotifications",
  ) => {
    if (!userId || !profile) return;

    const newPrefs = {
      ...profile.preferences,
      [field]: !profile.preferences[field],
    };
    setProfile({ ...profile, preferences: newPrefs });

    try {
      await api.patch(`/api/v1/users/${userId}/preferences`, {
        preferences: newPrefs,
      });
      toast.success("Preferences updated", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
    } catch {
      // Revert on error
      setProfile({ ...profile, preferences: profile.preferences });
      toast.error("Failed to update preferences", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
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
      toast.success("Default payment method updated", {
        style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
      });
    } catch {
      toast.error("Failed to update payment method", {
        style: { borderRadius: "10px", background: "#FFC7C7", color: "#333" },
      });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "upcoming":
        return "text-amber-400 bg-amber-400/10";
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "cancelled":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-slate-400 bg-slate-400/10";
    }
  };

  // Loading skeleton
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
        {/* Page Header */}
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
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sticky top-4">
              {/* Account Summary */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold">
                  {userInfo?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-white">{userInfo?.username}</p>
                  <p className="text-xs text-slate-400">
                    Member since {profile?.memberSince}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {[
                  { id: "personal", label: "Personal Info" },
                  { id: "security", label: "Security" },
                  { id: "bookings", label: "Booking History" },
                  { id: "payments", label: "Payment Methods" },
                  { id: "preferences", label: "Preferences" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as ProfileSection)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Personal Info Section */}
            {activeSection === "personal" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditForm(userInfo || {});
                        setIsEditing(true);
                      }}
                      className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Full Name", key: "username", type: "text" },
                    {
                      label: "Email",
                      key: "email",
                      type: "email",
                      disabled: true,
                    },
                    // { label: "Phone", key: "phone", type: "tel" },
                    // {
                    //   label: "Date of Birth",
                    //   key: "dateOfBirth",
                    //   type: "date",
                    // },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {field.label}
                      </label>
                      {isEditing ? (
                        <input
                          type={field.type}
                          // Safely typecast the value to string to avoid TS object errors
                          value={
                            (editForm[
                              field.key as keyof typeof editForm
                            ] as string) || ""
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              [field.key]: e.target.value,
                            })
                          }
                          disabled={field.disabled}
                          className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                            field.disabled
                              ? "border-slate-700 text-slate-500 cursor-not-allowed"
                              : "border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          }`}
                        />
                      ) : (
                        <p className="text-slate-200 py-2.5">
                          {userInfo?.[field.key as keyof typeof profile] ||
                            "Not set"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">
                      Change Password
                    </h3>
                    <button
                      onClick={() => navigate("/reset-password")}
                      className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Update your password →
                    </button>
                  </div>

                  {/* Two-Factor Auth */}
                  <div className="flex items-center justify-between py-3 border-t border-slate-800">
                    <div>
                      <p className="font-medium text-white">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-slate-400">
                        Add an extra layer of security
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">
                      Active Sessions
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                        <div>
                          <p className="text-sm text-white">Current Device</p>
                          <p className="text-xs text-slate-400">
                            Chrome on macOS • Active now
                          </p>
                        </div>
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking History Section */}
            {activeSection === "bookings" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Booking History
                  </h2>
                  <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    View All →
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No bookings yet</p>
                    <button
                      onClick={() => navigate("/movies")}
                      className="mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Browse movies →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 bg-slate-800/50 rounded-xl border border-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">
                              {booking.movieTitle}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {booking.theater}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-300">
                          <span>
                            {new Date(booking.date).toLocaleDateString("en-IN")}
                          </span>
                          <span>•</span>
                          <span>{booking.time}</span>
                          <span>•</span>
                          <span>Seats: {booking.seats.join(", ")}</span>
                        </div>

                        {booking.status === "upcoming" && booking.qrCode && (
                          <div className="mt-4 flex items-center gap-3">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                              <span className="text-xs text-slate-900">QR</span>
                            </div>
                            <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                              View Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Section */}
            {activeSection === "payments" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">
                    Payment Methods
                  </h2>
                  <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    Add New →
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`p-4 rounded-xl border transition-colors ${
                        method.isDefault
                          ? "bg-amber-500/5 border-amber-500/30"
                          : "bg-slate-800/50 border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-300">
                            {method.type.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-white">
                              {method.type === "card"
                                ? `•••• ${method.last4}`
                                : method.upiId}
                            </p>
                            {method.expiry && (
                              <p className="text-xs text-slate-400">
                                Expires {method.expiry}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {method.isDefault ? (
                            <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                              Default
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleSetDefaultPayment(method._id)
                              }
                              className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  Preferences
                </h2>

                <div className="space-y-6">
                  {/* Default Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Default Location
                    </label>
                    <select
                      value={profile?.preferences.defaultLocation || ""}
                      onChange={(e) => {
                        if (!profile) return;
                        const newPrefs = {
                          ...profile.preferences,
                          defaultLocation: e.target.value,
                        };
                        setProfile({ ...profile, preferences: newPrefs });
                        handleToggleNotification("emailNotifications"); // Reuse API call pattern
                      }}
                      className="w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    >
                      <option value="">Select a city</option>
                      <option value="mumbai">Mumbai</option>
                      <option value="delhi">Delhi</option>
                      <option value="bangalore">Bangalore</option>
                      <option value="hyderabad">Hyderabad</option>
                    </select>
                  </div>

                  {/* Notification Toggles */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-300">
                      Notifications
                    </h3>

                    {[
                      {
                        key: "emailNotifications",
                        label: "Email notifications",
                        desc: "Booking confirmations, offers",
                      },
                      {
                        key: "smsNotifications",
                        label: "SMS notifications",
                        desc: "Show reminders, urgent updates",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between py-3 border-t border-slate-800"
                      >
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-slate-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            // checked={profile?.preferences[item.key as keyof typeof profile.preferences] || false}
                            onChange={() =>
                              handleToggleNotification(
                                item.key as
                                  | "emailNotifications"
                                  | "smsNotifications",
                              )
                            }
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
