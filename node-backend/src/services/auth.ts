import { prisma } from "../db.ts";
import { comparePassword, hashPassword } from "./password.ts";
import type {
    LoginResponse,
    LoginRequest,
    RegisterRequest,
    RefreshTokenResponse,
} from "../types/auth.ts";
import {
    generateAccessToken,
    generateTokens,
    verifyRefreshToken,
} from "./jwt.ts";
import { type User } from "../generated/prisma/client.ts";

export const register = async (data: RegisterRequest): Promise<User> => {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email: data.email }],
        },
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(data.password);
    return prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            isActive: true,
        },
    });
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
        throw new Error("User is not active");
    }

    const isPasswordValid = await comparePassword(
        data.password,
        user.password,
    );

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const tokenPayload = {
        userId: user.id,
        email: user.email,
    };

    return generateTokens(tokenPayload);
};

export const refreshToken = async (
    refreshToken: string,
): Promise<RefreshTokenResponse> => {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
        throw new Error("Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return {
        access: generateAccessToken({ userId: user.id, email: user.email }),
    };
};

export const validateUser = async (userId: number) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            isStaff: true,
            isSuperuser: true,
        },
    });
};
