import type { AuthenticatedRequest } from "../../types/auth.ts";
import type { Response } from "express";
import { prisma } from "../../db.ts";

export const eventsListHandler = async (
    req: AuthenticatedRequest,
    res: Response,
) => {
    try {
        const eventType = (req.query.type as string) || "";
        const userId = req.user?.id; // Предполагается middleware аутентификации

        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }

        // Базовые условия запроса
        const baseConditions: any = {
            isCancelled: false,
        };

        let whereClause: any = baseConditions;

        // Фильтрация по типу
        const currentDate = new Date();

        switch (eventType) {
            case "my":
                // События, в которых участвует текущий пользователь
                whereClause = {
                    ...baseConditions,
                    participations: {
                        some: {
                            userId: userId,
                        },
                    },
                };
                break;

            case "active":
                // Активные события (текущая дата между startDate и endDate)
                whereClause = {
                    ...baseConditions,
                    startDate: {
                        lte: currentDate,
                    },
                    endDate: {
                        gte: currentDate,
                    },
                };
                break;

            case "past":
                // Прошедшие события (endDate меньше текущей даты)
                whereClause = {
                    ...baseConditions,
                    endDate: {
                        lt: currentDate,
                    },
                };
                break;

            default:
                // Все события (без дополнительной фильтрации)
                whereClause = baseConditions;
        }

        // Выполняем запрос
        const events = await prisma.event.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        participations: true,
                    },
                },
                participations: {
                    where: {
                        userId: userId,
                    },
                    select: {
                        userId: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startDate: "asc",
            },
        });

        // Форматируем ответ
        const formattedEvents = events.map((event) => {
            const participantsCount = event._count?.participations || 0;
            const userParticipated = event.participations.length > 0;

            // Проверяем, является ли событие активным
            let isActive = false;
            if (event.endDate) {
                isActive =
                    currentDate >= event.startDate &&
                    currentDate <= event.endDate;
            } else {
                isActive = currentDate >= event.startDate;
            }

            return {
                id: event.id,
                title: event.title,
                image: event.image,
                short_description: event.shortDescription,
                full_description: event.fullDescription,
                start_date: event.startDate.toISOString(),
                end_date: event.endDate.toISOString(),
                payment_info: event.paymentInfo,
                participants_count: participantsCount,
                max_participants_count: event.maxParticipantsCount,
                is_active: isActive,
                is_cancelled: event.isCancelled,
                created_at: event.createdAt.toISOString(),
                created_by: event.createdBy
                    ? {
                          id: event.createdBy.id,
                          username: event.createdBy.username,
                          email: event.createdBy.email,
                      }
                    : null,
                user_participated: userParticipated,
            };
        });
        res.json(formattedEvents);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
