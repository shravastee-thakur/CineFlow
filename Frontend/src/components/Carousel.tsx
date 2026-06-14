import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

interface MovieCardData {
  id: string;
  title: string;
  genre: string;
  rating: number;
  imageUrl: string;
}

const TRENDING_MOVIES: MovieCardData[] = [
  {
    id: "1",
    title: "Masters of the Universe",
    genre: "Action | Thriller",
    rating: 4,
    imageUrl: "./Movie 2.png",
  },
  {
    id: "2",
    title: "Karuppu",
    genre: "Action | Thriller",
    rating: 3,
    imageUrl: "./Movie1.png",
  },
  {
    id: "3",
    title: "29",
    genre: "Comedy | Romance",
    rating: 3,
    imageUrl: "./Movie 3.png",
  },
];

const HorizontalMovieCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", checkScrollBounds);
    checkScrollBounds();
    const resizeObserver = new ResizeObserver(checkScrollBounds);
    resizeObserver.observe(container);
    return () => {
      container.removeEventListener("scroll", checkScrollBounds);
      resizeObserver.disconnect();
    };
  }, [checkScrollBounds]);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.85;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 md:py-8 bg-slate-950" aria-label="Trending movies">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white">
            Trending Now
          </h2>
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
              canScrollLeft
                ? "bg-slate-900/80 hover:bg-slate-800/90 text-white opacity-100 shadow-lg"
                : "bg-slate-900/20 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            ref={containerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") scroll("left");
              if (e.key === "ArrowRight") scroll("right");
            }}
          >
            {TRENDING_MOVIES.map((movie) => (
              <div
                key={movie.id}
                className="carousel-card flex-none snap-start w-[85vw] sm:w-[650px] md:w-[850px] lg:w-[1139px] aspect-[1139/339] relative group/card rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                <img
                  src={movie.imageUrl}
                  alt={`${movie.title} movie poster`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0" />
                <div className="absolute inset-0" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 flex items-end justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full border border-amber-500/30 backdrop-blur-sm">
                      {movie.genre}
                    </span>
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white drop-shadow-md">
                      {movie.title}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <svg
                      className="w-3.5 h-3.5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {movie.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
              canScrollRight
                ? "bg-slate-900/80 hover:bg-slate-800/90 text-white opacity-100 shadow-lg"
                : "bg-slate-900/20 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HorizontalMovieCarousel;
