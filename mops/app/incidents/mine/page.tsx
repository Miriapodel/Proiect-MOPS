"use client";

import useSWR from "swr";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PaginationControls from "@/app/components/PaginationControls";
import PageSizeSelector from "@/app/components/PageSizeSelector";
import { IncidentCard } from "@/app/components/IncidentCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Using shared IncidentCard component for consistent UI

export default function MyIncidentsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const { data, isLoading, error } = useSWR(
        `/api/incidents/mine?page=${page}&pageSize=${pageSize}`,
        fetcher,
        { refreshInterval: 5000 }
    );

    const goToPage = (p: number) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", String(p));
        params.set("pageSize", String(pageSize));
        router.push(`/incidents/mine?${params.toString()}`);
    };

    if (isLoading)
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    if (error)
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-red-600">Failed to load.</div>
            </div>
        );
    if (!data?.success)
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="text-red-600">Error: {data?.error || "unknown"}</div>
            </div>
        );

    const incidents = data.data as Array<any>;
    const totalPages = data.totalPages as number;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-green-800">My Incidents</h1>
                    <p className="text-sm text-gray-600">All incidents you reported and their current statuses.</p>
                </div>

                {incidents.length === 0 ? (
                    <div className="p-6 bg-white border-2 border-green-100 rounded-2xl text-gray-600">
                        You have no reported incidents.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {incidents.map((inc) => (
                            <IncidentCard key={inc.id} incident={inc} currentUserId={inc.userId} />
                        ))}
                    </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-4">
                    <PaginationControls page={page} totalPages={totalPages} />
                    <PageSizeSelector options={[5, 10, 20, 50, 100]} label="" />
                </div>
            </div>
        </div>
    );
}
