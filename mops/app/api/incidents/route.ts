import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createIncidentSchema } from '@/app/lib/validations/incident';
import { getCurrentUser } from '@/lib/currentUser';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trebuie să fii autentificat pentru a crea un incident',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createIncidentSchema.parse(body);

    // Create incident in database
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
        message: 'Incidentul a fost creat cu succes',
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date de intrare invalide',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors
    console.error('Incident creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Eroare la crearea incidentului',
      },
      { status: 500 }
    );
  }
}

// Get all incidents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Eroare la încărcarea incidentelor' },
      { status: 500 }
    );
  }
}

// Delete an incident
export async function DELETE(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trebuie să fii autentificat pentru a șterge un incident',
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
          error: 'ID-ul incidentului este necesar',
        },
        { status: 400 }
      );
    }

    // Check if incident exists and belongs to the user
    const incident = await prisma.incident.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!incident) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incidentul nu a fost găsit',
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (incident.userId !== currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nu aveți permisiunea de a șterge acest incident',
        },
        { status: 403 }
      );
    }

    // Delete the incident
    await prisma.incident.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Incident șters cu succes',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Eroare la ștergerea incidentului',
      },
      { status: 500 }
    );
  }
}

