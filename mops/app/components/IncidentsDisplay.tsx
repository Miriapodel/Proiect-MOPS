'use client';

import { useState, useCallback } from 'react';
import { IncidentsList } from '@/app/components/IncidentsList';
import FilterButton from '@/app/components/FilterButton';
import PaginationControls from '@/app/components/PaginationControls';
import PageSizeSelector from '@/app/components/PageSizeSelector';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config';

interface IncidentsDisplayProps {
  initialIncidents: any[];
  initialTotal: number;
  initialPages: number;
  currentPage: number;
  pageSize: number;
  currentUserId?: string;
}

export default function IncidentsDisplay({
  initialIncidents,
  initialTotal,
  initialPages,
  currentPage,
  pageSize,
  currentUserId,
}: IncidentsDisplayProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [size, setSize] = useState(pageSize);

  const handleFilter = useCallback(
    async (filters: {
      category?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          pageSize: size.toString(),
          ...(filters.category && { category: filters.category }),
          ...(filters.status && { status: filters.status }),
          ...(filters.startDate && { startDate: filters.startDate }),
          ...(filters.endDate && { endDate: filters.endDate }),
        });

        const response = await fetch(`/api/incidents/list?${params}`);
        const data = await response.json();

        setIncidents(data.items);
        setTotal(data.total);
        setPages(data.pages);
        setPage(1);
      } catch (error) {
        console.error('Filter error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [size]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-green-100 flex items-center justify-between">
        <p className="text-gray-700 font-semibold">
          Total incidents: <span className="text-green-700">{total}</span>
        </p>
        <FilterButton onFilter={handleFilter} />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading incidents...</p>
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No incidents with this filter
          </h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your filter criteria
          </p>
        </div>
      ) : (
        <>
          <IncidentsList incidents={incidents} currentUserId={currentUserId} />

          <div className="flex items-center justify-center gap-4">
            <PaginationControls page={page} totalPages={pages} />
            <PageSizeSelector options={[5, 10, 20, 50, 100]} label="" />
          </div>
        </>
      )}
    </div>
  );
}
