import type { AuthenticatedRequest } from "../../types/auth.ts";
import type { Response } from "express";
import { prisma } from "../../db.ts";

export const retrieveEventHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const rawEventID = req.params.eventID;
    const eventID = rawEventID ? +rawEventID : NaN;

    if (Number.isNaN(eventID)) {
        res.status(400).json({
            error: req.params,
            x: Number.isInteger(eventID),
        });
        return;
    }

    const event = await prisma.event.findUnique({
        where: {
            id: eventID,
        },
        include: {
            _count: {
                select: {
                    participations: true,
                },
            },
            participations: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!event) {
        res.status(404).json({ error: "Event not found" });
        return;
    }

    const participantsCount = event._count?.participations || 0;
    const currentDate = new Date();

    let isActive = false;
    if (event.endDate) {
        isActive =
            currentDate >= event.startDate && currentDate <= event.endDate;
    } else {
        isActive = currentDate >= event.startDate;
    }

    let userParticipated = true;
    const userId = req.user?.id;
    if (userId && event.participations) {
        userParticipated = event.participations.some(
            (participant) => participant.userId === userId,
        );
    }

    const formattedEvent = {
        id: event.id,
        title: event.title,
        image: event.image,
        short_description: event.shortDescription,
        full_description: event.fullDescription,
        start_date: event.startDate.toISOString(),
        end_date: event.endDate ? event.endDate.toISOString() : null,
        payment_info: event.paymentInfo,
        participants_count: participantsCount,
        max_participants_count: event.maxParticipantsCount,
        user_participated: userParticipated,
        is_active: isActive,
    };
    res.json(formattedEvent);
};
