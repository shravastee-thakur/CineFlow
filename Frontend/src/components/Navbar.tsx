import { useState, useRef, useEffect } from "react";

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

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState<Location>(LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (loc: Location) => {
    setActiveLocation(loc);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-slate-700 border-b border-slate-800 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <a href="/" className="flex-shrink-0 group">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Cine
            <span className="text-amber-400 group-hover:text-amber-300 transition-colors">
              Flow
            </span>
          </span>
        </a>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-auto">
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
              placeholder="Find movies, cinemas, or events..."
              className="w-full bg-slate-700 text-slate-100 placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 border border-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        {/* Right: Location Dropdown */}
        <div className="relative">
          <button
            type="button"
            // aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            // onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-xl border border-gray-500 hover:border-amber-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <svg
              className="h-5 w-5 text-amber-400"
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
            <span className="hidden sm:inline font-medium text-slate-200">
              {activeLocation.name}
            </span>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
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
              className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50"
            >
              {LOCATIONS.map((loc) => (
                <li
                  key={loc.id}
                  role="option"
                  aria-selected={activeLocation.id === loc.id}
                  className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer transition-colors text-slate-300 hover:text-white flex items-center justify-between"
                  onClick={() => handleLocationSelect(loc)}
                >
                  {loc.name}
                  {activeLocation.id === loc.id && (
                    <svg
                      className="h-4 w-4 text-amber-400"
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
      </div>

      {/* Mobile Search Fallback */}
      <div className="mt-3 md:hidden">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
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
            placeholder="Find movies..."
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl py-2 pl-10 pr-4 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            // value={searchQuery}
            // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            //   setSearchQuery(e.target.value)
            // }
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
