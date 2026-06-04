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

interface BookingHistoryProps {
  bookings: Booking[];
  onViewAll: () => void;
}

export default function BookingHistory({
  bookings,
  onViewAll,
}: BookingHistoryProps) {
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

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Booking History</h2>
        <button
          onClick={onViewAll}
          className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No bookings yet</p>
          <button
            onClick={onViewAll}
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
                  <p className="text-sm text-slate-400">{booking.theater}</p>
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
  );
}
