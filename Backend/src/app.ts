import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { sanitizeMiddleware } from "./middlewares/sanitize.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
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
// app.use("/api/v1/users", userRoutes);
// http://localhost:5000/api/v1/user/register
app.use(errorHandler);

export default app;
