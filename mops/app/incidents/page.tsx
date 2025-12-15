import { getCurrentUser } from '@/lib/currentUser';
import Link from 'next/link';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';
import ExportButton from '@/app/components/ExportButton';
import IncidentsDisplay from '@/app/components/IncidentsDisplay';
import { IncidentsList } from '@/app/components/IncidentsList';
import { listIncidents } from '@/services/incidents.service';
import { IncidentStatus } from '@/app/generated/prisma';

export const dynamic = 'force-dynamic';

export default async function IncidentsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const pageParam = typeof params?.page === 'string' ? params?.page : Array.isArray(params?.page) ? params?.page[0] : undefined;
  const pageSizeParam = typeof params?.pageSize === 'string' ? params?.pageSize : Array.isArray(params?.pageSize) ? params?.pageSize[0] : undefined;
  const status = typeof params?.status === 'string' ? params?.status : undefined;
  const category = typeof params?.category === 'string' ? params?.category : undefined;
  const startDate = typeof params?.startDate === 'string' ? params?.startDate : undefined;
  const endDate = typeof params?.endDate === 'string' ? params?.endDate : undefined;

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const rawSize = parseInt(pageSizeParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);

  const { items: incidents, total, pages: totalPages } = await listIncidents({
    page,
    pageSize,
    status: status as IncidentStatus | undefined,
    category,
    startDate,
    endDate
  });
  const currentUser = await getCurrentUser();

  return (
    <div className="page-container">
      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">Incident List</h1>
          <p className="page-subtitle">
            All reports submitted by citizens
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/report"
              className="btn-primary inline-flex"
            >
              <span>Report new incident</span>
            </Link>
            <ExportButton userRole={currentUser?.role} />
          </div>
        </header>

        {incidents.length === 0 && !category && !status && !startDate && !endDate ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              No incidents reported yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to report a problem in your community!
            </p>
            <Link
              href="/report"
              className="btn-primary inline-flex"
            >
              <span>➕</span>
              <span>Report first incident</span>
            </Link>
          </div>
        ) : (
          <IncidentsDisplay
            initialIncidents={incidents}
            initialTotal={total}
            initialPages={totalPages}
            currentPage={page}
            pageSize={pageSize}
            currentUserId={currentUser?.id}
          />
        )}
      </div>
    </div>
  );
}
