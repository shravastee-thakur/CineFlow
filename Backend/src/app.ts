import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { sanitizeMiddleware } from "./middlewares/sanitize.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import screenRoutes from "./routes/screenRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutea.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

const allowedOrigins = [env.FRONTEND_URL, env.NETLIFY_URL];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new ApiError(401, "Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(sanitizeMiddleware);

// Routes
app.use("/api/v1/users", userRoutes);
// http://localhost:5000/api/v1/users/register

app.use("/api/v1/movies", movieRoutes);
// http://localhost:5000/api/v1/movies/createMovie

app.use("/api/v1/theaters", theaterRoutes);
// http://localhost:5000/api/v1/theaters/createTheater

app.use("/api/v1/screens", screenRoutes);
// http://localhost:5000/api/v1/screens/createScreen

app.use("/api/v1/shows", showRoutes);
// http://localhost:5000/api/v1/shows/createShow

app.use("/api/v1/bookings", bookingRoutes);
// http://localhost:5000/api/v1/bookings/createBooking

app.use("/api/v1/payments", paymentRoutes);
// http://localhost:5000/api/v1/payments/payment

app.use(errorHandler);

export default app;
