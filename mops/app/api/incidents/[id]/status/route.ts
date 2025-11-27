import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import { IncidentStatus, Role } from '@/app/generated/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!Object.values(IncidentStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const isAdmin = user.role === Role.ADMIN;
    const isAssignedOperator =
      user.role === Role.OPERATOR && incident.assignedToId === user.id;

    if (!isAdmin && !isAssignedOperator) {
      return NextResponse.json(
        { error: 'Forbidden: Only Admins or the assigned Operator can update this incident.' },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.incidentHistory.create({
        data: {
          incidentId: incident.id,
          changedById: user.id,
          oldStatus: incident.status,
          newStatus: status as IncidentStatus,
        },
      });

      const updatedIncident = await tx.incident.update({
        where: { id: incident.id },
        data: { status: status as IncidentStatus },
      });

      return updatedIncident;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating incident status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}