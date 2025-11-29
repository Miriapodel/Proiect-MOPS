import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { IncidentStatus, Role } from "@/app/generated/prisma";
import StatusForm from "@/app/components/StatusForm";
import Comments from "@/app/components/Comments";


type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getIncident(id: string) {
    const incident = await prisma.incident.findUnique({
        where: { id },
        include: {
            user: {
                select: { firstName: true, lastName: true, email: true },
            },
            history: {
                orderBy: { createdAt: "desc" },
                include: {
                    changedBy: {
                        select: { firstName: true, lastName: true, email: true },
                    },
                },
            },
        },
    });
    return incident;
}

export default async function IncidentDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const sp = await searchParams;
    const rawReturnTo = typeof sp?.returnTo === 'string' ? sp.returnTo : undefined;
    const decodedReturnTo = rawReturnTo ? decodeURIComponent(rawReturnTo) : undefined;
    const safeBackHref = decodedReturnTo && decodedReturnTo.startsWith('/incidents') ? decodedReturnTo : '/incidents';
    const currentUser = await getCurrentUser();
    const incident = await getIncident(id);

    if (!incident) {
        notFound();
    }

    const canManage =
        currentUser &&
        (currentUser.role === Role.ADMIN || currentUser.role === Role.OPERATOR);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
            <div className="max-w-3xl mx-auto px-4 space-y-6">
                {/* ... (Header content remains the same) ... */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-green-900 mb-2">
                            Incident details
                        </h1>
                        <p className="text-gray-600 text-sm">
                            ID: <span className="font-mono">{incident.id}</span>
                        </p>
                    </div>
                    <Link
                        href={safeBackHref}
                        className="text-sm text-green-700 hover:text-green-900 underline"
                    >
                        ← Back to list
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-green-100 p-6 space-y-4">
                    {/* ... (Details content remains the same) ... */}
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 mb-2 uppercase tracking-wide">
                                {incident.category}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {incident.description}
                            </h2>
                            {incident.address && (
                                <p className="text-sm text-gray-500 mt-1">
                                    📍 {incident.address}
                                </p>
                            )}
                        </div>
                        <StatusBadge status={incident.status} />
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg">
                            {incident.description}
                        </p>
                    </div>

                    {incident.photos && incident.photos.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Photos ({incident.photos.length}):
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {incident.photos.map((photo: string, index: number) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-200 shadow-md hover:shadow-lg transition-all group"
                                    >
                                        <Image
                                            src={photo}
                                            alt={`Incident photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {canManage && (
                    <div className="bg-white rounded-xl shadow-md border border-green-100 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Update status
                        </h3>
                        <StatusForm incidentId={incident.id} currentStatus={incident.status} />
                    </div>
                )}

                {incident.history.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Status history
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            {incident.history.map((h) => (
                                <li
                                    key={h.id}
                                    className="flex justify-between items-start gap-4 border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {h.oldStatus} → {h.newStatus}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            by {h.changedBy.firstName} {h.changedBy.lastName} ({h.changedBy.email})
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(h.createdAt).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Comments */}
                <Comments incidentId={incident.id} />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: IncidentStatus }) {
    const map: Record<
        IncidentStatus,
        { label: string; className: string }
    > = {
        PENDING: {
            label: "Pending",
            className: "bg-yellow-100 text-yellow-800 border-yellow-300",
        },
        IN_PROGRESS: {
            label: "In progress",
            className: "bg-blue-100 text-blue-800 border-blue-300",
        },
        RESOLVED: {
            label: "Resolved",
            className: "bg-green-100 text-green-800 border-green-300",
        },
        REJECTED: {
            label: "Rejected",
            className: "bg-red-100 text-red-800 border-red-300",
        },
    };

    const cfg = map[status] ?? map.PENDING;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}