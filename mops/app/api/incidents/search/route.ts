import { NextRequest, NextResponse } from 'next/server';
import { searchIncidents } from '@/services/incidents.service';

const MAX_RESULTS = 50;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limitParam = searchParams.get('limit');

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
        },
        { status: 400 }
      );
    }

    // Parse limit with max of 50
    const limit = Math.min(Math.max(1, parseInt(limitParam || '50', 10) || 50), MAX_RESULTS);

    const incidents = await searchIncidents(query, limit);

    return NextResponse.json(
      {
        success: true,
        incidents,
        count: incidents.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error searching incidents',
      },
      { status: 500 }
    );
  }
}
