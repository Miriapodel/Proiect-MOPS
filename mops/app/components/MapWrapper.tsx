'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100 text-xl text-gray-600">
            Loading map...
        </div>
    )
});

interface Incident {
    id: string;
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string | null;
    photos: string[];
    status: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

export function MapWrapper({ incidents }: { incidents: Incident[] }) {
    return <Map incidents={incidents} />;
}

