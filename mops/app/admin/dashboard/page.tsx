"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/app/components/DateRangePicker";
import StatisticsChart from "@/app/components/StatisticsChart";
import useSWR from "swr";

type Statistics = {
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
  dateRange: {
    start: string;
    end: string;
  };
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Status color mapping
const statusColors: Record<string, string> = {
  PENDING: "#eab308",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#22c55e",
  REJECTED: "#ef4444",
};

// Category colors (green variants)
const categoryColors = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];

export default function AdminDashboardPage() {
  // Initialize with last 30 days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  // Build API URL with date params
  const apiUrl = dateRange.from && dateRange.to
    ? `/api/admin/statistics?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
    : null;

  const { data, error, isLoading } = useSWR<Statistics>(apiUrl, fetcher);

  // Transform data for charts
  const categoryData = data?.byCategory
    ? Object.entries(data.byCategory).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const statusData = data?.byStatus
    ? Object.entries(data.byStatus).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Total Count Card */}
      <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium text-green-700">
            Total Incidents
          </p>
          <p className="mt-2 text-5xl font-bold text-green-900">
            {isLoading ? "..." : error ? "Error" : data?.total ?? 0}
          </p>
          {data?.dateRange && (
            <p className="mt-2 text-sm text-gray-600">
              {new Date(data.dateRange.start).toLocaleDateString()} -{" "}
              {new Date(data.dateRange.end).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Failed to load statistics. Please try again.
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Category Chart */}
        <StatisticsChart
          data={categoryData}
          title="Incidents by Category"
          color="#2D5F3F"
        />

        {/* Status Chart */}
        <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-green-900">
            Incidents by Status
          </h3>
          {!statusData || statusData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              No data available for this period
            </div>
          ) : (
            <div className="space-y-4">
              {statusData.map((item, index) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.value / (data?.total || 1)) * 100}%`,
                        backgroundColor: statusColors[item.name] || "#2D5F3F",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          </div>
        </div>
      )}
    </div>
  );
}
