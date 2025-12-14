import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getIncidentStatistics } from "@/services/statistics.service";
import { isAppError, badRequest } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Default to last 30 days if no dates provided
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Validate dates
    if (isNaN(startDate.getTime())) {
      throw badRequest("Invalid startDate format");
    }
    if (isNaN(endDate.getTime())) {
      throw badRequest("Invalid endDate format");
    }
    if (startDate > endDate) {
      throw badRequest("startDate must be before or equal to endDate");
    }

    // Get statistics
    const statistics = await getIncidentStatistics(startDate, endDate);

    return NextResponse.json(statistics);
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
