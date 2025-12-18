import type { Request, Response } from "express";
import {login, refreshToken, register} from "../services/auth.ts";
import { sendVerificationCodeEmail } from "../services/email.ts";
import { prisma } from "../db.ts";
import { redisClient } from "../services/redis.ts";
import type {AuthenticatedRequest} from "../types/auth.js";

export const registerHandler = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const user = await register({ username, email, password });
    await sendVerificationCodeEmail(user);
    res.status(201).json(user);
};

export const verifyCodeHandler = async (req: Request, res: Response) => {
    let { code, user_id } = req.body;

    if (!code || !user_id) {
        res.status(400).json({ error: "code and user_id are required" });
        return;
    }

    code = +code;
    if (isNaN(code)) {
        res.status(400).json({ error: "code is invalid" });
        return;
    }

    const userId = +user_id;
    if (isNaN(userId)) {
        res.status(400).json({ error: "user_id must be integer" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        res.status(400).json({ error: "user not found" });
        return;
    }

    const redisKey = `${userId}:code`;
    const cachedCode = await redisClient.get(redisKey);
    if (!cachedCode || +cachedCode !== code) {
        res.status(400).json({ error: "code is invalid" });
        return;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            isActive: true,
        },
    });

    await redisClient.del(redisKey);
    // await sendSuccessRegistrationEmail(userId);
    res.status(204).send();
};

export const loginHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: "Email and password are required" });
    }

    const result = await login({ email, password });
    res.json(result);
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
    const refresh = req.body.refresh;
    if (!refresh) {
        return res.status(400).json({ error: "Refresh token is required" });
    }
    const result = await refreshToken(refresh);
    res.json(result);
};

export const retrieveUserHandler = async (req: AuthenticatedRequest, res: Response) => {
    res.json({username: req.user?.username, email: req.user?.email, is_staff: true || req.user?.isStaff})
}
