// Central Prisma singleton (HMR-safe in Next.js dev)
// Generated client output configured in `prisma/schema.prisma` => `../app/generated/prisma`
import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}