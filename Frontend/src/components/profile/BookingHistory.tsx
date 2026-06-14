import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface Booking {
  bookingId: string;
  movieTitle: string;
  theaterName: string;
  screenName: string;
  showTime: string;
  seats: string[];
  totalPrice: number;
  status: "confirmed" | "cancelled" | "pending" | "failed";
}

interface BookingHistoryProps {
  bookings: Booking[];
}

const INITIAL_DISPLAY = 5;
const ITEMS_PER_PAGE = 10;

// ✅ Pure utilities outside component
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatusColor = (status: Booking["status"]): string => {
  switch (status) {
    case "confirmed":
      return "text-green-400 bg-green-400/10 border-green-400/30";
    case "cancelled":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    case "pending":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
};

const BookingHistory = ({ bookings }: BookingHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));

  // ✅ Memoized display slice
  const displayedBookings = useMemo(() => {
    if (!showAll) return bookings.slice(0, INITIAL_DISPLAY);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return bookings.slice(start, start + ITEMS_PER_PAGE);
  }, [bookings, showAll, currentPage]);

  const handleToggleView = () => {
    setShowAll((prev) => !prev);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Booking History</h2>
          {showAll && bookings.length > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              Showing {displayedBookings.length} of {bookings.length} bookings
            </p>
          )}
        </div>
        {bookings.length > INITIAL_DISPLAY && (
          <button
            onClick={handleToggleView}
            className="text-sm text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap transition-colors"
          >
            {showAll ? "View Less ↑" : "View All →"}
          </button>
        )}
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">No bookings yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Your confirmed tickets will appear here
          </p>
        </div>
      ) : (
        <>
          {/* Bookings List */}
          <div className="space-y-4">
            {displayedBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-1">
                          {booking.movieTitle}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.theaterName} • {booking.screenName}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(booking.showTime)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {formatTime(booking.showTime)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        {booking.seats.join(", ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">
                          Booking ID
                        </p>
                        <p className="text-sm text-slate-300 font-mono">
                          {booking.bookingId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">
                          Total Paid
                        </p>
                        <p className="text-lg font-bold text-amber-400">
                          ₹{booking.totalPrice.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Only when showing all */}
          {showAll && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        currentPage === page
                          ? "bg-amber-500 text-slate-900"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;
