import { NextRequest, NextResponse } from 'next/server';
import { exportIncidents } from '@/services/incidents.service';
import { getCurrentUser } from '@/lib/currentUser';
import { Role, IncidentStatus } from '@/app/generated/prisma';
import { stringify } from 'csv-stringify/sync';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can export
    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only admins can export incidents',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        },
        { status: 400 }
      );
    }

    const incidents = await exportIncidents({
      startDate,
      endDate,
      category: category && category !== 'any' ? category : undefined,
      status: (status && status !== 'any' ? status as IncidentStatus : undefined),
    });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `incidents_export_${timestamp}`;

    if (format === 'xlsx') {
      // Export as XLSX
      const worksheet = XLSX.utils.json_to_sheet(incidents);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');

      // Auto-size columns
      const colWidths = Object.keys(incidents[0] || {}).map((key) => ({
        wch: Math.min(Math.max(key.length, 15), 50),
      }));
      worksheet['!cols'] = colWidths;

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    } else {
      // Export as CSV
      const csv = stringify(incidents, {
        header: true,
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'description', header: 'Description' },
          { key: 'category', header: 'Category' },
          { key: 'address', header: 'Address' },
          { key: 'status', header: 'Status' },
          { key: 'latitude', header: 'Latitude' },
          { key: 'longitude', header: 'Longitude' },
          { key: 'reportedBy', header: 'Reported By' },
          { key: 'reporterEmail', header: 'Reporter Email' },
          { key: 'createdAt', header: 'Created Date' },
          { key: 'updatedAt', header: 'Updated Date' },
          { key: 'comments', header: 'Comments' },
          { key: 'photosCount', header: 'Photos Count' },
        ],
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
          'Content-Type': 'text/csv; charset=utf-8',
        },
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error exporting incidents',
      },
      { status: 500 }
    );
  }
}
