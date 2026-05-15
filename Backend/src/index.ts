import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";

connectDb();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`Server is running on port: http://localhost:${port}`);
});
