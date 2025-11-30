// Shared DTO types and mapping utilities
import { Incident, Comment, Users, Photo } from "@/app/generated/prisma";

export type IncidentSummaryDTO = {
    id: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    latitude: number;
    longitude: number;
    address: string | null;
    photoIds: string[];
    user?: { firstName: string; lastName: string; email?: string };
};

export function mapIncidentToSummary(inc: Incident & { user?: Users; photos?: { id: string }[] }): IncidentSummaryDTO {
    return {
        id: inc.id,
        description: inc.description,
        category: inc.category,
        status: inc.status,
        createdAt: inc.createdAt.toISOString(),
        latitude: inc.latitude,
        longitude: inc.longitude,
        address: inc.address ?? null,
        photoIds: (inc.photos as any)?.map((p: { id: string }) => p.id) ?? [],
        user: inc.user ? { firstName: inc.user.firstName, lastName: inc.user.lastName, email: inc.user.email } : undefined,
    };
}

export type CommentDTO = {
    id: string;
    content: string;
    createdAt: string;
    parentId: string | null;
    incidentId: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    deletedAt: string | null;
};

export function mapCommentToDTO(c: Comment & { user?: Users }): CommentDTO {
    return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        parentId: c.parentId ?? null,
        incidentId: c.incidentId,
        userId: c.userId,
        firstName: c.user?.firstName,
        lastName: c.user?.lastName,
        deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
    };
}
