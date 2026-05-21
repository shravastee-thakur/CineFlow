import { env } from "./env.js";
import { Redis, RedisOptions } from "ioredis";

if (!env.IOREDIS_URL) {
  throw new Error("IOREDIS_URL environment variable is not defined");
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

export const redis = new Redis(env.IOREDIS_URL, redisOptions);
