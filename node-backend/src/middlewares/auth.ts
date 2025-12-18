import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../services/jwt.ts";
import { validateUser } from "../services/auth.ts";
import type { AuthenticatedRequest } from "../types/auth.ts";

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token || "");
    if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await validateUser(payload.userId);
    if (!user) {
        return res.status(401).json({ error: "User not found" });
    }

    if (!user.isActive) {
        return res.status(401).json({ error: "User is not active" });
    }

    req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        isStaff: user.isStaff,
        isSuperuser: user.isSuperuser,
    };
    next();
};
