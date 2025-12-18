import type { Response } from "express";
import { prisma } from "../../db.ts";
import type { AuthenticatedRequest } from "../../types/auth.ts";

export const createEventHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    const data = req.body;
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
        return;
    }

    if (endDate <= startDate) {
        res.status(400).json({ error: "End date must be after start date" });
        return;
    }

    const event = await prisma.event.create({
        data: {
            title: data.title,
            image: data.image || "https://via.placeholder.com/300x200",
            shortDescription: data.short_description,
            fullDescription: data.full_description,
            startDate: startDate,
            endDate: endDate,
            paymentInfo: data.payment_info,
            maxParticipantsCount: Number.isInteger(data.maxParticipantsCount)
                ? data.maxParticipantsCount
                : null,
            createdById: req.user?.id!,
            isCancelled: false,
        },
        select: {
            id: true,
            title: true,
            image: true,
            shortDescription: true,
            fullDescription: true,
            startDate: true,
            endDate: true,
            paymentInfo: true,
            maxParticipantsCount: true,
            isCancelled: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });

    const formattedEvent = {
        id: event.id,
        title: event.title,
        image: event.image,
        short_description: event.shortDescription,
        full_description: event.fullDescription,
        start_date: event.startDate.toISOString(),
        end_date: event.endDate.toISOString(),
        payment_info: event.paymentInfo,
        max_participants_count: event.maxParticipantsCount,
        is_cancelled: event.isCancelled,
        created_at: event.createdAt.toISOString(),
        created_by: event.createdBy
            ? {
                  id: event.createdBy.id,
                  username: event.createdBy.username,
                  email: event.createdBy.email,
              }
            : null,
        participants_count: 0,
        is_active: true,
    };
    res.status(201).json(formattedEvent);
};
