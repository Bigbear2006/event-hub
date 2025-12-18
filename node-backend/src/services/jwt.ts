import jwt from "jsonwebtoken";
import { type TokenPayload } from "../types/auth.ts";

const SECRET_KEY = process.env.SECRET_KEY!;
const ACCESS_EXPIRY = 5 * 60 * 1000;
const REFRESH_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, SECRET_KEY, {
        expiresIn: ACCESS_EXPIRY,
    });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, SECRET_KEY, {
        expiresIn: REFRESH_EXPIRY,
    });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, SECRET_KEY) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, SECRET_KEY) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const generateTokens = (payload: TokenPayload) => {
    return {
        access: generateAccessToken(payload),
        refresh: generateRefreshToken(payload),
    };
};
