import { env } from "./config/env.js";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";


import { startBookingCleanupCron } from "./crons/bookingCleanup.js";

connectDb();
const port = env.PORT;

startBookingCleanupCron();

app.listen(port, () => {
  logger.info(`Server is running on port: http://localhost:${port}`);
});
