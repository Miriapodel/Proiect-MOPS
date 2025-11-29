import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/currentUser';
import Link from 'next/link';
import { IncidentCard } from '@/app/components/IncidentCard';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';
import PageSizeSelector from '@/app/components/PageSizeSelector';
import PaginationControls from '@/app/components/PaginationControls';

export const dynamic = 'force-dynamic';

async function getPaginatedIncidents(params: { page: number; pageSize: number; status?: string | null; category?: string | null; }) {
  const { page, pageSize, status, category } = params;
  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const skip = (page - 1) * pageSize;

  const [incidents, total] = await prisma.$transaction([
    prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.incident.count({ where }),
  ]);

  return { incidents, total };
}

function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800 border-green-300' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${config.color}`}>
      {config.label}
    </span>
  );
}

export default async function IncidentsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const pageParam = typeof params?.page === 'string' ? params?.page : Array.isArray(params?.page) ? params?.page[0] : undefined;
  const pageSizeParam = typeof params?.pageSize === 'string' ? params?.pageSize : Array.isArray(params?.pageSize) ? params?.pageSize[0] : undefined;
  const status = typeof params?.status === 'string' ? params?.status : undefined;
  const category = typeof params?.category === 'string' ? params?.category : undefined;

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const rawSize = parseInt(pageSizeParam || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(1, rawSize), MAX_PAGE_SIZE);

  const { incidents, total } = await getPaginatedIncidents({ page, pageSize, status, category });
  const currentUser = await getCurrentUser();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
