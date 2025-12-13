"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  value: number;
};

type StatisticsChartProps = {
  data: ChartData[];
  title: string;
  color?: string;
};

export default function StatisticsChart({
  data,
  title,
  color = "#2D5F3F",
}: StatisticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-green-900">{title}</h3>
        <div className="flex h-64 items-center justify-center text-gray-500">
          No data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-green-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#374151" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            tick={{ fill: "#374151" }}
            axisLine={{ stroke: "#d1d5db" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="value" fill={color} name="Count" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
