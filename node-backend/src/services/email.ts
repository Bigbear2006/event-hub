import nodemailer from "nodemailer";
import type { User } from "../generated/prisma/client.ts";
import { redisClient } from "./redis.ts";

const EMAIL_HOST_USER = process.env.EMAIL_HOST_USER;
const EMAIL_HOST_PASSWORD = process.env.EMAIL_HOST_PASSWORD;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: EMAIL_HOST_USER,
        pass: EMAIL_HOST_PASSWORD,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
    await transporter.sendMail({
        from: EMAIL_HOST_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
};

export const sendVerificationCodeEmail = async (user: User) => {
    const code = Math.floor(Math.random() * 9000) + 1000;
    console.log(await redisClient.set(`${user.id}:code`, code, { EX: 300 }));
    await sendEmail({
        to: user.email,
        subject: "Активация аккаунта",
        html: `Ваш код подтверждения: ${code}`,
    });
};
