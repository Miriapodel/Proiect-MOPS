import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createIncidentSchema } from '@/app/lib/validations/incident';
import { getCurrentUser } from '@/lib/currentUser';
import { ZodError } from 'zod';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';

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

    const incident = await prisma.incident.create({
      data: {
        description: validatedData.description,
        category: validatedData.category,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        address: validatedData.address || null,
        photos: validatedData.photos,
        status: 'PENDING',
        userId: currentUser.id,
      },
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
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
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

    const [incidents, total] = await prisma.$transaction([
      prisma.incident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return NextResponse.json({ incidents, count: total, page, pageSize, totalPages }, { status: 200 });
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

    const incident = await prisma.incident.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!incident) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incident not found',
        },
        { status: 404 }
      );
    }

    if (incident.userId !== currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to delete this incident',
        },
        { status: 403 }
      );
    }

    await prisma.incident.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Incident deleted successfully',
      },
      { status: 200 }
    );
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