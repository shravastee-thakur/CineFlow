import dotenv from "dotenv";
dotenv.config();
import arcjet, { shield, detectBot } from "@arcjet/node";
import { ApiError } from "./apiError.js";

const arcjetSecret = process.env.ARCJET_KEY;
if (!arcjetSecret) {
  throw new ApiError(500, "arcjetSecret environment variable is not defined");
}

const aj = arcjet({
  key: arcjetSecret,
  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",

      allow: [
        "CATEGORY:SEARCH_ENGINE", // Googlebot, Bingbot, etc.
      ],
    }),
  ],
});

export default aj;
