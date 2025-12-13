import { getCurrentUser } from '@/lib/currentUser';
import Link from 'next/link';
import { IncidentCard } from '@/app/components/IncidentCard';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';
import PageSizeSelector from '@/app/components/PageSizeSelector';
import PaginationControls from '@/app/components/PaginationControls';
import ExportButton from '@/app/components/ExportButton';
import { listIncidents } from '@/services/incidents.service';
import { IncidentStatus } from '@/app/generated/prisma';

export const dynamic = 'force-dynamic';

export default async function IncidentsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const pageParam = typeof params?.page === 'string' ? params?.page : Array.isArray(params?.page) ? params?.page[0] : undefined;
  const pageSizeParam = typeof params?.pageSize === 'string' ? params?.pageSize : Array.isArray(params?.pageSize) ? params?.pageSize[0] : undefined;
  const status = typeof params?.status === 'string' ? params?.status : undefined;
  const category = typeof params?.category === 'string' ? params?.category : undefined;

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const rawSize = parseInt(pageSizeParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);

  const { items: incidents, total, pages: totalPages } = await listIncidents({
    page,
    pageSize,
    status: status as IncidentStatus | undefined,
    category
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

        {incidents.length === 0 ? (
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
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-4 border-2 border-green-100">
              <p className="text-gray-700 font-semibold">
                Total incidents: <span className="text-green-700">{total}</span>
              </p>
            </div>

            <div className="grid gap-6">
              {incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  currentUserId={currentUser?.id}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <PaginationControls page={page} totalPages={totalPages} />
              <PageSizeSelector options={[5, 10, 20, 50, 100]} label="" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
