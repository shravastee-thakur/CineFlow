import { Redis, RedisOptions } from "ioredis";
import { Queue, QueueOptions } from "bullmq";

// import dotenv from "dotenv";
// dotenv.config();

if (!process.env.IOREDIS_URL) {
  throw new Error("IOREDIS_URL environment variable is not defined");
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

export const redis = new Redis(process.env.IOREDIS_URL, redisOptions);

const queueOptions: QueueOptions = {
  connection: redis,
};

export const mailQueue = new Queue("mailQueue", queueOptions);
