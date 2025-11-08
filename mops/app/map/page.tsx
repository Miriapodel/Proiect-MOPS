'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            fontSize: '20px',
            color: '#666'
        }}>
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