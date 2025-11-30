import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listUserIncidents } from "@/services/incidents.service";
import { isAppError } from "@/lib/errors";
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
        const { items, total, pages } = await listUserIncidents(user.id, { page, pageSize });
        return NextResponse.json({ success: true, data: items, page, pageSize, total, totalPages: pages });
    } catch (e) {
        if (isAppError(e)) {
            return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
        }
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
