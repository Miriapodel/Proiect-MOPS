"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
    options?: number[];
    label?: string;
};

export default function PageSizeSelector({ options = [10, 20, 50, 100], label = "Per page" }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const current = parseInt(searchParams.get("pageSize") || "10", 10);

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams as any);
        params.set("pageSize", value);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            {label && <label className="text-xs text-gray-700">{label}</label>}
            <select
                className="px-2 py-1 border border-green-200 rounded-lg text-xs text-gray-800 bg-white hover:bg-green-50"
                value={current}
                onChange={onChange}
            >
                {options.map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
        </div>
    );
}
