'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = ['', 'Street Lighting', 'Potholes', 'Garbage', 'Illegal Parking', 'Other'];
const STATUSES = ['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

interface FilterButtonProps {
  onFilter?: (filters: {
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export default function FilterButton({ onFilter }: FilterButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showOptions, setShowOptions] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const handleFilter = () => {
    const filters = {
      ...(category && { category }),
      ...(status && { status }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    // Call the onFilter callback if provided (for client-side updates)
    if (onFilter) {
      onFilter(filters);
    }

    // Also update the URL
    router.push(`/incidents${params.toString() ? `?${params.toString()}` : ''}`);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="btn-primary inline-flex"
      >
        Filter
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  cat && (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((stat) => (
                  stat && (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  )
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleFilter}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Apply Filter
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


