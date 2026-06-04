import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
}

const LOCATIONS: Location[] = [
  { id: "ny", name: "New York" },
  { id: "la", name: "Los Angeles" },
  { id: "chi", name: "Chicago" },
  { id: "hou", name: "Houston" },
];

export default function Navbar() {
  const { userId, role, isVerified, clearAuth } = useAuthStore();

  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<Location>(LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const authMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        authMenuRef.current &&
        !authMenuRef.current.contains(event.target as Node)
      ) {
        setIsAuthMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const handleLocationSelect = (loc: Location) => {
    setActiveLocation(loc);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`,
      );
      if (res.data.success) {
        toast.success(res.data.message, {
          style: { borderRadius: "10px", background: "#AAFFC7", color: "#333" },
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
      clearAuth();
      setIsAuthMenuOpen(false);
      navigate("/");
    }
  };

  const isAdmin = role === "admin";

  return (
    <nav className="bg-slate-700 border-b border-slate-800 px-3 sm:px-4 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo */}
        <Link
          to="/"
          className="flex-shrink-0 group"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
            Cine
            <span className="text-amber-400 group-hover:text-amber-300 transition-colors">
              Flow
            </span>
          </span>
        </Link>

        {/* Center: Search (Desktop only, compact) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-auto">
          <div className="relative w-full">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 rounded-lg py-2 pl-9 pr-3 text-sm border border-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location Dropdown (Compact) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-600 hover:border-amber-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <svg
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="hidden xs:inline text-xs sm:text-sm font-medium text-slate-200">
                {activeLocation.name}
              </span>
              <svg
                className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul
                role="listbox"
                className="absolute right-0 mt-1.5 w-40 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50"
              >
                {LOCATIONS.map((loc) => (
                  <li
                    key={loc.id}
                    role="option"
                    aria-selected={activeLocation.id === loc.id}
                    className="px-3 py-2 hover:bg-slate-800 cursor-pointer transition-colors text-slate-300 hover:text-white text-sm flex items-center justify-between"
                    onClick={() => handleLocationSelect(loc)}
                  >
                    {loc.name}
                    {activeLocation.id === loc.id && (
                      <svg
                        className="h-3.5 w-3.5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Auth Button / Avatar Menu */}
          <div className="relative" ref={authMenuRef}>
            {!isVerified ? (
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hidden sm:inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Sign Up
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isAuthMenuOpen}
                  onClick={() => setIsAuthMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold text-xs sm:text-sm border border-amber-500/30">
                    {userId?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {isAuthMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-1.5 w-40 bg-slate-900 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setIsAuthMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      role="menuitem"
                    >
                      Profile
                    </Link>

                    {/* Admin Link - Only for admin users */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsAuthMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors font-medium"
                        role="menuitem"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl z-40">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search movies..."
                className="w-full bg-slate-700 text-slate-100 placeholder-slate-400 rounded-lg py-2 pl-9 pr-3 text-sm border border-slate-600 focus:border-amber-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile Location */}
            <div className="flex items-center justify-between py-2 border-t border-slate-700">
              <span className="text-sm text-slate-400">Location</span>
              <select
                value={activeLocation.id}
                onChange={(e) => {
                  const loc = LOCATIONS.find((l) => l.id === e.target.value);
                  if (loc) handleLocationSelect(loc);
                }}
                className="bg-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:border-amber-500 focus:outline-none"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Auth */}
            {!isVerified ? (
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Profile
                </Link>

                {/* Admin Link - Mobile */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
