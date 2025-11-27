'use client';

import { useState } from "react";
import { IncidentStatus } from "@/app/generated/prisma";

export default function StatusForm({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: IncidentStatus;
}) {
  const [status, setStatus] = useState<IncidentStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onChange(newStatus: IncidentStatus) {
    if (newStatus === status || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/incidents/${incidentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update status");
        return;
      }

      const updated = await res.json();
      setStatus(updated.status as IncidentStatus);
      setSuccess("Status updated");
    } catch (e) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(IncidentStatus.IN_PROGRESS)}
          disabled={loading || status === IncidentStatus.IN_PROGRESS}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
        >
          Mark in progress
        </button>
        <button
          type="button"
          onClick={() => onChange(IncidentStatus.RESOLVED)}
          disabled={loading || status === IncidentStatus.RESOLVED}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
        >
          Mark resolved
        </button>
        <button
          type="button"
          onClick={() => onChange(IncidentStatus.REJECTED)}
          disabled={loading || status === IncidentStatus.REJECTED}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {loading && <p className="text-xs text-gray-500">Updating…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">{success}</p>}
    </div>
  );
}
