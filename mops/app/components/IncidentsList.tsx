'use client';

import { useState } from 'react';
import { IncidentCard } from './IncidentCard';

interface Incident {
  id: string;
  category: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  photoIds?: string[];
  upvotes?: number;
  createdAt: Date;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface IncidentsListProps {
  incidents: Incident[];
  currentUserId?: string;
}

export function IncidentsList({ incidents: initialIncidents, currentUserId }: IncidentsListProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);

  const handleUpvote = (incidentId: string, newUpvotes: number) => {
    // Update the upvotes for the specific incident
    const updatedIncidents = incidents.map((incident) =>
      incident.id === incidentId ? { ...incident, upvotes: newUpvotes } : incident
    );

    // Re-sort by upvotes (descending) then by createdAt (descending)
    updatedIncidents.sort((a, b) => {
      if ((b.upvotes ?? 0) !== (a.upvotes ?? 0)) {
        return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setIncidents(updatedIncidents);
  };

  return (
    <div className="grid gap-6">
      {incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          currentUserId={currentUserId}
          onUpvote={handleUpvote}
        />
      ))}
    </div>
  );
}
