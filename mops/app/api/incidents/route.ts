import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { createIncidentSchema } from '@/app/lib/validations/incident';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
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

