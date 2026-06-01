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

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.FRONTEND_URL,
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

app.use(errorHandler);

export default app;
