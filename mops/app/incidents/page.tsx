import { prisma } from '@/app/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getIncidents() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return incidents;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
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

export default async function IncidentsPage() {
  const incidents = await getIncidents();

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
            <div className="text-6xl mb-4">📭</div>
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
                Total incidents: <span className="text-green-700">{incidents.length}</span>
              </p>
            </div>

            <div className="grid gap-6">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-green-900">
                          {incident.category}
                        </h2>
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        📅 {new Date(incident.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description:</h3>
                    <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {incident.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Location:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                      {incident.address && (
                        <p className="text-gray-800">
                          📍 {incident.address}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 font-mono">
                        Coordinates: {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {/* Photos */}
                  {incident.photos.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Photos ({incident.photos.length}):
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {incident.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-200 shadow-md hover:shadow-lg transition-all group"
                          >
                            <Image
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t-2 border-gray-100">
                    <p className="text-xs text-gray-500">
                      ID: {incident.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
