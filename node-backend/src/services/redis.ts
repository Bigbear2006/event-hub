import { createClient } from "redis";

export const redisClient = createClient({
    url: "redis://@redis:6379/0",
    password: process.env.REDIS_PASSWORD!,
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
