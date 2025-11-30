import { prisma } from "@/lib/prisma";
import { notFound, badRequest, forbidden } from "@/lib/errors";
import { IncidentStatus, Role } from "@/app/generated/prisma";

export type ListIncidentsParams = {
    page?: number;
    pageSize?: number;
    status?: IncidentStatus;
    category?: string;
    userId?: string; // filter by reporter
};

export type CreateIncidentInput = {
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    photoIds?: string[];
    userId: string;
};

export async function listIncidents(params: ListIncidentsParams = {}) {
    const page = Math.max(params.page || 1, 1);
    const pageSize = Math.min(Math.max(params.pageSize || 10, 1), 100);
    const where: any = {};

    if (params.status)
        where.status = params.status;
    if (params.category)
        where.category = params.category;
    if (params.userId)
        where.userId = params.userId;

    const [items, total] = await Promise.all([
        prisma.incident.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { firstName: true, lastName: true, email: true } }, photos: { select: { id: true } } },
        }),
        prisma.incident.count({ where }),
    ]);

    return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export async function getIncident(id: string) {
    const incident = await prisma.incident.findUnique({
        where: { id },
        include: {
            user: { select: { firstName: true, lastName: true } },
            comments: true,
            history: true,
        },
    });
    if (!incident) throw notFound("Incident not found", { id });
    return incident;
}

export async function createIncident(data: CreateIncidentInput) {
    return prisma.$transaction(async (tx) => {
        const incident = await tx.incident.create({
            data: {
                description: data.description,
                category: data.category,
                latitude: data.latitude,
                longitude: data.longitude,
                address: data.address ?? null,
                userId: data.userId,
            },
            include: { user: { select: { firstName: true, lastName: true } }, photos: { select: { id: true } } },
        });
        if (data.photoIds && data.photoIds.length > 0) {
            await tx.photo.updateMany({
                where: { id: { in: data.photoIds } },
                data: { incidentId: incident.id },
            });
        }
        return incident;
    });
}

export async function listUserIncidents(userId: string, params: Omit<ListIncidentsParams, "userId"> = {}) {
    return listIncidents({ ...params, userId });
}

export async function updateIncidentStatus(incidentId: string, changedById: string, newStatus: IncidentStatus) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });

    if (!incident)
        throw notFound("Incident not found", { incidentId });
    if (incident.status === newStatus)
        return incident;

    const validStatuses: IncidentStatus[] = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

    if (!validStatuses.includes(newStatus))
        throw badRequest("Invalid status", { newStatus });

    return prisma.$transaction(async (tx) => {
        const updated = await tx.incident.update({
            where: { id: incidentId },
            data: { status: newStatus },
        });
        await tx.incidentHistory.create({
            data: {
                incidentId,
                changedById,
                oldStatus: incident.status,
                newStatus,
            },
        });
        return updated;
    });
}

export async function deleteIncident(incidentId: string, requesterId: string) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId }, select: { userId: true } });

    if (!incident)
        throw notFound("Incident not found", { incidentId });
    if (incident.userId !== requesterId)
        throw forbidden("Cannot delete incident you do not own", { incidentId });

    await prisma.incident.delete({ where: { id: incidentId } });
    return { id: incidentId, deleted: true };
}

export async function requireIncident(incidentId: string) {
    const inc = await prisma.incident.findUnique({ where: { id: incidentId } });

    if (!inc)
        throw notFound("Incident not found", { incidentId });

    return inc;
}

export async function updateIncidentStatusWithPermission(
    incidentId: string,
    userId: string,
    userRole: Role,
    newStatus: IncidentStatus
) {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId }, select: { assignedToId: true } });

    if (!incident)
        throw notFound("Incident not found", { incidentId });

    const isAdmin = userRole === Role.ADMIN;
    const isAssignedOperator = userRole === Role.OPERATOR && incident.assignedToId === userId;

    if (!isAdmin && !isAssignedOperator)
        throw forbidden("Only Admins or the assigned Operator can update this incident", { incidentId });

    return updateIncidentStatus(incidentId, userId, newStatus);
}
