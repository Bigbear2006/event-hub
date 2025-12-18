import { type Express, json } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.ts";
import { authRouter } from "./routers/auth.ts";
import { eventsRouter } from "./routers/events.ts";
import { redisClient } from "./services/redis.ts";

interface CORSOptions {
    origin: string | string[];
}

export const setupMiddlewares = (app: Express, options: CORSOptions) => {
    app.use(json());
    app.use(cors({ origin: options.origin }));
    app.use(errorMiddleware);
};

export const setupRouters = (app: Express) => {
    app.use("/api/auth", authRouter);
    app.use("/api/events", eventsRouter);
};

interface ServerOptions {
    host: string;
    port: number;
}

export const run = (app: Express, options: ServerOptions) => {
    app.listen(options.port, options.host, async () => {
        await redisClient.connect();
        console.log(`Server is running on http://localhost:${options.port}`);
    });
};

interface AppOptions {
    server: ServerOptions;
    cors: CORSOptions;
}

export const main = (app: Express, options: AppOptions) => {
    setupMiddlewares(app, options.cors);
    setupRouters(app);
    run(app, options.server);
};
