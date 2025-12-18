import {
    loginHandler,
    refreshTokenHandler,
    registerHandler, retrieveUserHandler,
    verifyCodeHandler,
} from "../handlers/auth.ts";
import express from "express";
import {authMiddleware} from "../middlewares/auth.ts";

export const authRouter = express.Router();
authRouter.post("/user/register/", registerHandler);
authRouter.post("/user/verify-code/", verifyCodeHandler);
authRouter.post("/user/login/", loginHandler);
authRouter.post("/user/refresh-token/", refreshTokenHandler);
authRouter.get("/user/", authMiddleware, retrieveUserHandler);