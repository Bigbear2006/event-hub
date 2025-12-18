import express from "express";
import dotenv from "dotenv";
import { main } from "./bootstrap.ts";

dotenv.config();

const app = express();
main(app, {
    server: {
        host: "0.0.0.0",
        port: 8000,
    },
    cors: { origin: ["http://localhost:5173"] },
});
