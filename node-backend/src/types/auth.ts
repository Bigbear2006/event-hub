import type { Request } from "express";

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
}

export interface TokenPayload {
    userId: number;
    email: string;
}

export interface RefreshTokenResponse {
    access: string;
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        email: string;
        isStaff: boolean;
        isSuperuser: boolean;
    };
}
