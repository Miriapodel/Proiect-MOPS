'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface IncidentCardProps {
  incident: {
    id: string;
    category: string;
    description: string;
    status: string;
    latitude: number;
    longitude: number;
    address: string | null;
    photos: string[];
    createdAt: Date;
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  currentUserId?: string;
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

export function IncidentCard({ incident, currentUserId }: IncidentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const isOwner = currentUserId === incident.userId;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/incidents?id=${incident.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete incident');
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-green-900">
              {incident.category}
            </h2>
            {getStatusBadge(incident.status)}
          </div>
          <p className="text-sm text-gray-600 mb-1">
            Reported by: <span className="font-semibold text-green-700">{incident.user.firstName} {incident.user.lastName}</span>
            {isOwner && <span className="ml-2 text-xs text-green-600 font-semibold">(You)</span>}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(incident.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Delete Button - Only shown to owner */}
        {isOwner && (
          <div className="ml-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-red-600 font-semibold">Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs font-semibold"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-xs font-semibold"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Error:</span> {deleteError}
          </p>
        </div>
      )}

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
  );
}

