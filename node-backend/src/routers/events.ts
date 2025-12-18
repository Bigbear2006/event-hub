import express from "express";
import { authMiddleware } from "../middlewares/auth.ts";
import { eventsListHandler } from "../handlers/events/list.ts";
import { createEventHandler } from "../handlers/events/create.ts";
import { retrieveEventHandler } from "../handlers/events/retrieve.ts";
import {
    cancelEventParticipationHandler,
    createEventParticipationHandler,
} from "../handlers/events/participate.ts";

export const eventsRouter = express.Router();
eventsRouter.use(authMiddleware);
eventsRouter.get("/", eventsListHandler);
eventsRouter.post("/", createEventHandler);
eventsRouter.get("/:eventID/", retrieveEventHandler);
eventsRouter.post("/:eventID/participate/", createEventParticipationHandler);
eventsRouter.delete("/:eventID/participate/", cancelEventParticipationHandler);
