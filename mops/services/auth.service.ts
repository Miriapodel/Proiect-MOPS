import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { conflict, notFound, badRequest } from "@/lib/errors";

export type CreateUserInput = {
    firstName: string;
    lastName: string;
    email: string;
    password: string; // plain text input
};

export async function findUserByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
}

export async function createUser(data: CreateUserInput) {
    const existing = await findUserByEmail(data.email);

    if (existing)
        throw conflict("Email already registered", { email: data.email });

    const hash = await bcrypt.hash(data.password, 12);

    return prisma.users.create({
        data: { ...data, password: hash },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
}

export async function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
}

export async function requireUserByEmail(email: string) {
    const user = await findUserByEmail(email);

    if (!user)
        throw notFound("User not found", { email });

    return user;
}

// Password reset functions
export async function generateResetToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
}

export async function requestPasswordReset(email: string) {
    const user = await findUserByEmail(email);

    if (!user) {
        // Don't reveal if user exists - security best practice
        return { success: true };
    }

    const resetToken = await generateResetToken();
    const expiryMinutes = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || '15');
    const resetTokenExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.users.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetTokenExpiry,
        },
    });

    return { success: true, resetToken, user };
}

export async function validateResetToken(token: string) {
    const user = await prisma.users.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gte: new Date(),
            },
        },
    });

    if (!user) {
        throw badRequest("Invalid or expired reset token");
    }

    return user;
}

export async function resetPassword(token: string, newPassword: string) {
    const user = await validateResetToken(token);
    const hash = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
        where: { id: user.id },
        data: {
            password: hash,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    return user;
}
