import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // retained for now (will migrate GET fully)
import { createIncidentSchema } from '@/app/lib/validations/incident';
import { getCurrentUser } from '@/lib/currentUser';
import { ZodError } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';
import { createIncident, listIncidents, deleteIncident } from '@/services/incidents.service';
import { isAppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must be authenticated to create an incident',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createIncidentSchema.parse(body);

    const incident = await createIncident({
      description: validatedData.description,
      category: validatedData.category,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      address: validatedData.address || null,
      photoIds: validatedData.photoIds,
      userId: currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        incident,
        message: 'Incident created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Incident creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error creating incident',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const rawSize = parseInt(pageSizeParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
    const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const statusFilter = (status && ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) ? status as any : undefined;
    const { items, total, pages } = await listIncidents({ page, pageSize, status: statusFilter, category: category || undefined });
    return NextResponse.json({ incidents: items, count: total, page, pageSize, totalPages: pages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Error loading incidents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must be authenticated to delete an incident',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incident ID is required',
        },
        { status: 400 }
      );
    }

    try {
      await deleteIncident(id, currentUser.id);
      return NextResponse.json({ success: true, message: 'Incident deleted successfully' }, { status: 200 });
    } catch (err) {
      if (isAppError(err)) {
        return NextResponse.json({ success: false, error: err.message, code: err.code }, { status: err.status });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error deleting incident',
      },
      { status: 500 }
    );
  }
}