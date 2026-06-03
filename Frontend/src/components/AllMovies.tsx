import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

interface Movie {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: number;
  format: string;
  thumbnailUrl: string;
}

// Mock data for demonstration (replace with API fetch)
const AllMovies: Movie[] = Array.from({ length: 25 }, (_, i) => ({
  id: `${i + 1}`,
  title: [
    "Dune Prophecy",
    "Wicked",
    "Gladiator II",
    "Moana 2",
    "Red One",
    "Venom 3",
    "The Wild Robot",
    "Smile 2",
    "Terrifier 3",
    "Anora",
    "Conclave",
    "Heretic",
    "The Substance",
    "Nosferatu",
    "A Complete Unknown",
    "Sonic 3",
    "Mufasa",
    "Kraven",
    "Bridget Jones 4",
    "Avatar 3",
    "F1",
    "Blade",
    "Fantastic Four",
    "Superman Legacy",
    "Mission Impossible 8",
  ][i % 25],
  genre: [
    "Sci-Fi",
    "Musical",
    "Drama",
    "Animation",
    "Action",
    "Horror",
    "Thriller",
  ][i % 7],
  language: ["English", "Hindi", "Tamil", "Telugu", "Malayalam"][i % 5],
  rating: Math.round((7 + Math.random() * 2.5) * 10) / 10,
  format: ["IMAX", "2D", "3D", "4DX", "Dolby"][i % 5],
  thumbnailUrl: `/images/movie-${i + 1}.jpg`,
}));

const FILTER_OPTIONS = {
  genre: [
    "Action",
    "Drama",
    "Sci-Fi",
    "Thriller",
    "Animation",
    "Horror",
    "Musical",
  ],
  language: ["English", "Hindi", "Tamil", "Telugu", "Malayalam"],
  rating: ["7+", "8+", "9+"],
  format: ["IMAX", "2D", "3D", "4DX", "Dolby"],
};

export default function NewReleasesSection() {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: "",
    language: "",
    rating: "",
    format: "",
  });

  const ITEMS_PER_PAGE = 10;
  const INITIAL_DISPLAY = 6;

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setShowAll(false);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ genre: "", language: "", rating: "", format: "" });
    setShowAll(false);
    setCurrentPage(1);
  };

  const filteredMovies = useMemo(() => {
    return AllMovies.filter((m) => {
      return (
        (!filters.genre || m.genre === filters.genre) &&
        (!filters.language || m.language === filters.language) &&
        (!filters.rating ||
          m.rating >= Number(filters.rating.replace("+", ""))) &&
        (!filters.format || m.format === filters.format)
      );
    });
  }, [filters]);

  const displayedMovies = showAll
    ? filteredMovies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : filteredMovies.slice(0, INITIAL_DISPLAY);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovies.length / ITEMS_PER_PAGE),
  );

  return (
    <section className="py-6 md:py-10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
            New Releases
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 sm:pb-0 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
              {(Object.keys(filters) as Array<keyof typeof filters>).map(
                (key) => (
                  <select
                    key={key}
                    value={filters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    aria-label={`Filter by ${key}`}
                    className="flex-shrink-0 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 capitalize"
                  >
                    <option value="">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                    {FILTER_OPTIONS[key].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ),
              )}
              {(filters.genre ||
                filters.language ||
                filters.rating ||
                filters.format) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 whitespace-nowrap px-2"
                >
                  Clear All
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowAll(!showAll);
                setCurrentPage(1);
              }}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap transition-colors"
            >
              {showAll ? "View Less ↑" : "View All →"}
            </button>
          </div>
        </div>

        {/* Movie Grid */}
        {displayedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayedMovies.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="group block focus:outline-none"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-amber-500/50 transition-colors mb-2">
                  <img
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {movie.genre} • {movie.language}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No movies match your filters</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {showAll && filteredMovies.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    currentPage === pageNum
                      ? "bg-amber-500 text-slate-900"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
