import { prisma } from "@/lib/prisma";
import { notFound, forbidden, badRequest } from "@/lib/errors";
import { requireIncident } from "./incidents.service";

export type CreateCommentInput = {
    incidentId: string;
    userId: string;
    content: string;
    parentId?: string | null;
};

export async function listComments(incidentId: string) {
    return prisma.comment.findMany({
        where: { incidentId },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { firstName: true, lastName: true } }, replies: true },
    });
}

export async function createComment(input: CreateCommentInput) {
    await requireIncident(input.incidentId);

    if (input.parentId) {
        const parent = await prisma.comment.findUnique({ where: { id: input.parentId }, select: { id: true, incidentId: true } });

        if (!parent || parent.incidentId !== input.incidentId)
            throw badRequest("Parent comment is invalid", { parentId: input.parentId });
    }

    return prisma.comment.create({
        data: {
            incidentId: input.incidentId,
            userId: input.userId,
            content: input.content,
            parentId: input.parentId ?? null,
        },
        include: { user: { select: { firstName: true, lastName: true } } },
    });
}

export type DeleteCommentResult = { id: string; softDeleted: boolean };

export async function deleteComment(commentId: string, incidentId: string, requesterId: string, requesterRole: string): Promise<DeleteCommentResult> {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { replies: { select: { id: true } } },
    });

    if (!comment)
        throw notFound("Comment not found", { commentId });
    if (comment.incidentId !== incidentId)
        throw badRequest("Comment does not belong to incident", { commentId, incidentId });

    const isOwner = comment.userId === requesterId;
    const isPrivileged = ["ADMIN", "OPERATOR"].includes(requesterRole);

    if (!isOwner && !isPrivileged)
        throw forbidden("Not allowed to delete", { commentId });

    const hasReplies = comment.replies.length > 0;

    if (hasReplies) {
        await prisma.comment.update({ where: { id: commentId }, data: { deletedAt: new Date() } });
        return { id: commentId, softDeleted: true };
    } else {
        await prisma.comment.delete({ where: { id: commentId } });
        return { id: commentId, softDeleted: false };
    }
}
