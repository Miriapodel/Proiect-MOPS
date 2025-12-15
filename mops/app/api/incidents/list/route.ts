import { listIncidents } from '@/services/incidents.service';
import { IncidentStatus } from '@/app/generated/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status') as IncidentStatus | undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const result = await listIncidents({
      page,
      pageSize,
      status,
      category,
      startDate,
      endDate,
    });

    return Response.json(result);
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
