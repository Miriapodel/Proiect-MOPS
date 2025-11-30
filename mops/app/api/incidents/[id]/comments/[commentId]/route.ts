import { NextRequest, NextResponse } from 'next/server';
import { deleteComment } from '@/services/comments.service';
import { getCurrentUser } from '@/lib/currentUser';
import { isAppError } from '@/lib/errors';

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

        // Service enforces ownership or privileged roles; original behavior allowed only owner.
        try {
            const result = await deleteComment(commentId, incidentId, user.id, user.role);
            return NextResponse.json({ success: true, softDeleted: result.softDeleted });
        } catch (err) {
            if (isAppError(err)) {
                return NextResponse.json({ success: false, error: err.message, code: err.code }, { status: err.status });
            }
            throw err;
        }
    } catch (error: any) {
        console.error('Delete comment error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
