import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { ZodError } from 'zod';
import { createCommentSchema } from '@/app/lib/validations/comment';
``
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const rows = await prisma.comment.findMany({
            where: { incidentId: id },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { firstName: true, lastName: true } } },
        });

        const comments = rows.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            parentId: c.parentId,
            incidentId: c.incidentId,
            userId: c.userId,
            firstName: c.user.firstName,
            lastName: c.user.lastName,
            deletedAt: c.deletedAt,
        }));

        return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Eroare la încărcarea comentariilor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Trebuie să fii autentificat pentru a comenta' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = createCommentSchema.parse(body);

        // ensure incident exists
        const incident = await prisma.incident.findUnique({ where: { id } });
        if (!incident) {
            return NextResponse.json({ error: 'Incidentul nu există' }, { status: 404 });
        }

        // if replying, ensure parent belongs to same incident
        if (parsed.parentId) {
            const parent = await prisma.comment.findUnique({
                where: { id: parsed.parentId },
                select: { id: true, incidentId: true },
            });
            if (!parent || parent.incidentId !== id) {
                return NextResponse.json({ error: 'Comentariul părinte este invalid' }, { status: 400 });
            }
        }

        const createdRow = await prisma.comment.create({
            data: {
                content: parsed.content.trim(),
                incidentId: id,
                userId: user.id,
                parentId: parsed.parentId ?? null,
            },
            include: { user: { select: { firstName: true, lastName: true } } },
        });

        const created = {
            id: createdRow.id,
            content: createdRow.content,
            createdAt: createdRow.createdAt,
            parentId: createdRow.parentId,
            incidentId: createdRow.incidentId,
            userId: createdRow.userId,
            firstName: createdRow.user.firstName,
            lastName: createdRow.user.lastName,
            deletedAt: createdRow.deletedAt,
        };

        return NextResponse.json({ success: true, comment: created }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Date de intrare invalide',
                    details: error.issues.map((err) => ({ field: err.path.join('.'), message: err.message })),
                },
                { status: 400 }
            );
        }
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Eroare la crearea comentariului' }, { status: 500 });
    }
}
