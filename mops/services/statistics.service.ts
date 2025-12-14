import { prisma } from "@/lib/prisma";

export type IncidentStatistics = {
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  total: number;
  dateRange: {
    start: string;
    end: string;
  };
};

export async function getIncidentStatistics(
  startDate: Date,
  endDate: Date
): Promise<IncidentStatistics> {
  const where = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Run all queries in parallel for performance
  const [categoryStats, statusStats, total] = await Promise.all([
    prisma.incident.groupBy({
      by: ["category"],
      where,
      _count: { id: true },
    }),
    prisma.incident.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    }),
    prisma.incident.count({ where }),
  ]);

  // Transform groupBy results into simple key-value objects
  const byCategory: Record<string, number> = {};
  categoryStats.forEach((stat) => {
    byCategory[stat.category] = stat._count.id;
  });

  const byStatus: Record<string, number> = {};
  statusStats.forEach((stat) => {
    byStatus[stat.status] = stat._count.id;
  });

  return {
    byCategory,
    byStatus,
    total,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}
