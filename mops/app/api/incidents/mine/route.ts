import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "@/lib/config";

const querySchema = z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)).refine((v) => Number.isFinite(v) && v > 0, {
        message: "page must be a positive integer",
    }),
    pageSize: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : DEFAULT_PAGE_SIZE))
        .refine((v) => Number.isFinite(v) && v > 0 && v <= MAX_PAGE_SIZE, {
            message: `pageSize must be between 1 and ${MAX_PAGE_SIZE}`,
        }),
});

export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(req.url);
    const qs = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.safeParse(qs);
    if (!parsed.success) {
        return NextResponse.json(
            {
                error: "Invalid query",
                details: parsed.error.issues,
            },
            { status: 400 }
        );
    }

    const { page, pageSize } = parsed.data as { page: number; pageSize: number };
    const skip = (page - 1) * pageSize;

    try {
        const [items, total] = await prisma.$transaction([
            prisma.incident.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
                select: {
                    id: true,
                    description: true,
                    category: true,
                    status: true,
                    createdAt: true,
                    photos: true,
                    latitude: true,
                    longitude: true,
                    address: true,
                },
            }),
            prisma.incident.count({ where: { userId: user.id } }),
        ]);

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        return NextResponse.json({
            success: true,
            data: items,
            page,
            pageSize,
            total,
            totalPages,
        });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
