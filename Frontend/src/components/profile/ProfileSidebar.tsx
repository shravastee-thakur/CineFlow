import { ProfileSection } from "../../pages/User/UserProfilePage";

interface ProfileSidebarProps {
  userInfo: any;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

export default function ProfileSidebar({
  userInfo,
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  const navItems: { id: ProfileSection; label: string }[] = [
    { id: "personal", label: "Personal Info" },
    { id: "bookings", label: "Booking History" },
  ];

  return (
    <aside className="lg:col-span-1">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sticky top-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold">
            {userInfo?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium text-white">{userInfo?.username}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
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
  );
}
