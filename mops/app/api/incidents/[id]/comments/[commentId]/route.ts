import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: incidentId, commentId } = await params;

        // Find comment
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                replies: true,
            },
        });

        if (!comment) {
            return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
        }

        // Verify comment belongs to incident
        if (comment.incidentId !== incidentId) {
            return NextResponse.json({ success: false, error: 'Comment does not belong to this incident' }, { status: 400 });
        }

        // Only author can delete
        if (comment.userId !== user.id) {
            return NextResponse.json({ success: false, error: 'You can only delete your own comments' }, { status: 403 });
        }

        // Check if comment has replies
        const hasReplies = comment.replies && comment.replies.length > 0;

        if (hasReplies) {
            // Soft delete: mark as deleted but keep in DB for thread continuity
            await prisma.comment.update({
                where: { id: commentId },
                data: { deletedAt: new Date() },
            });
        } else {
            // Hard delete: no replies, remove completely
            await prisma.comment.delete({
                where: { id: commentId },
            });
        }

        return NextResponse.json({ success: true, softDeleted: hasReplies });
    } catch (error: any) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
