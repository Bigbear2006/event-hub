import type { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
};
