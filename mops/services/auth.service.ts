import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { conflict, notFound } from "@/lib/errors";

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
