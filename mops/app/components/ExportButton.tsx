'use client';

import { useState } from 'react';
import { Role } from '@/app/generated/prisma';

interface ExportButtonProps {
  userRole?: string;
}

const CATEGORIES = ['any', 'Street Lighting', 'Potholes', 'Garbage', 'Illegal Parking', 'Other'];
const STATUSES = ['any', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export default function ExportButton({ userRole }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [showOptions, setShowOptions] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('any');
  const [status, setStatus] = useState('any');

  // Only show for admins
  if (userRole !== Role.ADMIN) {
    return null;
  }

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        format,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (category !== 'any') params.append('category', category);
      if (status !== 'any') params.append('status', status);

      const response = await fetch(`/api/incidents/export?${params}`);

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setShowOptions(false);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export incidents');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className="btn-primary inline-flex"
      >
        {isLoading ? 'Exporting...' : 'Export data'}
      </button>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={(e) => setFormat(e.target.value as 'csv')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">CSV</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={format === 'xlsx'}
                    onChange={(e) => setFormat(e.target.value as 'xlsx')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Excel (XLSX)</span>
                </label>
              </div>
            </div>

            {/* Date Filters */}
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
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'any' ? 'Any Category' : cat}
                  </option>
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
                {STATUSES.map((stat) => (
                  <option key={stat} value={stat}>
                    {stat === 'any' ? 'Any Status' : stat}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleExport}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {isLoading ? 'Exporting...' : 'Export'}
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
