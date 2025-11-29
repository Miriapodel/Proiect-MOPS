"use client";

import useSWR from "swr";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import PaginationControls from "@/app/components/PaginationControls";
import PageSizeSelector from "@/app/components/PageSizeSelector";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getStatusBadge(status: string) {
    const config: Record<string, { label: string; color: string }> = {
        PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-300" },
        RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800 border-green-300" },
        REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-300" },
    };
    const c = config[status] || config.PENDING;
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${c.color}`}>{c.label}</span>;
}

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
                    <ul className="space-y-4">
                        {incidents.map((inc) => (
                            <li key={inc.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 leading-snug truncate">
                                                <Link href={`/incidents/${inc.id}?returnTo=${encodeURIComponent(`/incidents/mine${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}`} className="hover:underline hover:text-green-800">
                                                    {inc.description}
                                                </Link>
                                            </h3>
                                            {getStatusBadge(inc.status)}
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                                {inc.category}
                                            </span>
                                        </div>
                                        {inc.address && (
                                            <p className="text-sm text-gray-600">📍 Address: {inc.address}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Submitted at: {new Date(inc.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        <Link
                                            href={`/incidents/${inc.id}?returnTo=${encodeURIComponent(`/incidents/mine${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)}`}
                                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 flex items-center justify-center gap-4">
                    <PaginationControls page={page} totalPages={totalPages} />
                    <PageSizeSelector options={[5, 10, 20, 50, 100]} label="" />
                </div>
            </div>
        </div>
    );
}
