import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { upvoteIncident } from "@/services/incidents.service";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const incidentId = body?.incidentId as string | undefined;

    if (!incidentId) {
      return NextResponse.json({ success: false, error: "incidentId is required" }, { status: 400 });
    }

    const result = await upvoteIncident(incidentId, currentUser.id);

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: any) {
    console.error("Upvote error:", error);
    return NextResponse.json({ success: false, error: "Error upvoting incident" }, { status: 500 });
  }
}
