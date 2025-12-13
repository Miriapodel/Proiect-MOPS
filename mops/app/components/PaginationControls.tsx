"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
    page: number;
    totalPages: number;
};

export default function PaginationControls({ page, totalPages }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const go = (p: number) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", String(p));
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => go(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-green-200 text-sm font-semibold text-green-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50"
            >
                Back
            </button>
            <span className="text-sm text-gray-700">Page {page} / {totalPages}</span>
            <button
                onClick={() => go(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
}
