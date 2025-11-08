'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100 text-xl text-gray-600">
            Loading map...
        </div>
    )
});

export default function MapPage() {
    return (
        <div>
            <Map />
        </div>
    );
}