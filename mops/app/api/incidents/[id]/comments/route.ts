import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // retained for mapping shape; service returns similar rows
import { getCurrentUser } from '@/lib/currentUser';
import { ZodError } from 'zod';
import { createCommentSchema } from '@/app/lib/validations/comment';
import { listComments, createComment } from '@/services/comments.service';
import { isAppError } from '@/lib/errors';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const rows = await listComments(id);
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
        return NextResponse.json({ error: 'Error loading comments' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be authenticated to comment' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = createCommentSchema.parse(body);

        let createdRow;
        try {
            createdRow = await createComment({
                incidentId: id,
                userId: user.id,
                content: parsed.content.trim(),
                parentId: parsed.parentId ?? null,
            });
        } catch (err) {
            if (isAppError(err)) {
                return NextResponse.json({ success: false, error: err.message, code: err.code }, { status: err.status });
            }
            throw err;
        }

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
                    error: 'Invalid input data',
                    details: error.issues.map((err) => ({ field: err.path.join('.'), message: err.message })),
                },
                { status: 400 }
            );
        }
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Error creating comment' }, { status: 500 });
    }
}
