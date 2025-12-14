import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ hasVoted: false }, { status: 200 });
    }

    const incidentId = request.nextUrl.searchParams.get("incidentId") as string | null;

    if (!incidentId) {
      return NextResponse.json({ success: false, error: "incidentId is required" }, { status: 400 });
    }

    const vote = await prisma.incidentVote.findUnique({
      where: { incidentId_userId: { incidentId, userId: currentUser.id } },
    });

    return NextResponse.json({ hasVoted: !!vote }, { status: 200 });
  } catch (error: any) {
    console.error("Vote status check error:", error);
    return NextResponse.json({ success: false, error: "Error checking vote status" }, { status: 500 });
  }
}
