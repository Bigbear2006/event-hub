import type { AuthenticatedRequest } from "../../types/auth.ts";
import type { Response } from "express";
import { prisma } from "../../db.ts";
import { redisClient } from "../../services/redis.ts";

export const createEventParticipationHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const rawEventID = req.params.eventID;
    const userID = req.user?.id!;

    const eventID = +rawEventID!;
    if (!rawEventID || Number.isNaN(eventID)) {
        res.status(400).json({ error: "event id must be integer" });
        return;
    }

    const event = await prisma.event.findUnique({
        where: { id: eventID },
        include: {
            _count: {
                select: {
                    participations: true,
                },
            },
        },
    });
    if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
    }

    const participantsCount = event._count?.participations;
    if (
        event.maxParticipantsCount !== null &&
        participantsCount >= event.maxParticipantsCount
    ) {
        res.status(400).json({ error: "too many participants" });
        return;
    }

    const redisKey = `participation:${userID}:${eventID}`;
    const cachedRequest = await redisClient.get(redisKey);
    if (cachedRequest) {
        res.status(429).json({ error: "too many requests" });
        return;
    }

    const existingParticipation = await prisma.eventParticipation.findUnique({
        where: {
            userId_eventId: {
                userId: userID!,
                eventId: eventID,
            },
        },
    });

    let isNewParticipation;
    if (existingParticipation) {
        isNewParticipation = false;
    } else {
        await prisma.eventParticipation.create({
            data: {
                userId: userID,
                eventId: eventID,
            },
        });
        isNewParticipation = true;
    }

    if (isNewParticipation) {
        await redisClient.set(redisKey, "true", { EX: 60 });
        // await sendUserParticipatedEmail(eventId, userId);
        res.status(204).send();
    } else {
        res.status(204).send();
    }
};

export const cancelEventParticipationHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const rawEventID = req.params.eventID;
    const userID = req.user?.id!;

    const eventID = +rawEventID!;
    if (!rawEventID || Number.isNaN(eventID)) {
        res.status(400).json({ error: "event id must be integer" });
        return;
    }

    const event = await prisma.event.findUnique({
        where: { id: eventID },
    });
    if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
    }

    const existingParticipation = await prisma.eventParticipation.findUnique({
        where: {
            userId_eventId: {
                userId: userID,
                eventId: eventID,
            },
        },
    });
    // if (existingParticipation) {
    //     await sendUserCancelledParticipationEmail(eventId, userId);
    // }

    await prisma.eventParticipation.deleteMany({
        where: {
            userId: userID,
            eventId: eventID,
        },
    });
    res.status(204).send();
};
