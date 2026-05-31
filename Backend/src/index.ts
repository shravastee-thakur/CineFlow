import { env } from "./config/env.js";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";
import "./workers/mailWorker.js";

connectDb();
const port = env.PORT;

app.listen(port, () => {
  logger.info(`Server is running on port: http://localhost:${port}`);
});
