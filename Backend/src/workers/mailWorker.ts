import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { EmailJobData } from "../config/bullmq.js";
import sendMail from "../config/sendMail.js";
import logger from "../utils/logger.js";

const mailWorker = new Worker<EmailJobData, void, string>(
  "mailQueue", // Must match the name in your Queue setup
  async (job) => {
    const { to, subject, htmlContent, textContent } = job.data;
    if (!to || !subject) {
      throw new Error(
        `Invalid job data: missing recipient or subject for job ${job.id}`,
      );
    }
    await sendMail(to, subject, htmlContent);
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10, // Max 10 emails
      duration: 1000, // per second
    },
  },
);

mailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed successfully for ${job.data.to}`);
});

mailWorker.on("failed", (job, err) => {
  if (job)
    logger.error(
      `Email job ${job.id} failed for ${job.data.to}: ${err.message}`,
    );
});

mailWorker.on("error", (err) => {
  logger.error(`MailWorker critical error: ${err.message}`);
});

export default mailWorker;
