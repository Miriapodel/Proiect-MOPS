'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// News type definition
interface News {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    description: string;
    image: string;
}

// Hardcoded news data
const newsData: News[] = [
    {
        id: '1',
        name: 'Grand Opening of Central Park',
        location: { lat: 45.9432, lng: 24.9668 },
        description: 'A new beautiful park has opened in the city center with modern facilities.',
        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'
    },
    {
        id: '2',
        name: 'New Tech Hub Announced',
        location: { lat: 44.4268, lng: 26.1025 },
        description: 'Major tech companies are investing in a new innovation center.',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
    },
    {
        id: '3',
        name: 'Music Festival This Weekend',
        location: { lat: 46.7712, lng: 23.6236 },
        description: 'Three-day music festival featuring international and local artists.',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400'
    },
    {
        id: '4',
        name: 'Historical Monument Restored',
        location: { lat: 45.6572, lng: 25.6069 },
        description: 'The iconic landmark has been fully restored after 2 years of work.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    },
    {
        id: '5',
        name: 'Beach Cleanup Initiative',
        location: { lat: 44.1598, lng: 28.6348 },
        description: 'Volunteers gather for a massive beach cleanup campaign.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
    }
];

// Component to capture map instance and pass it up
function MapInstanceCapture({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
    const map = useMap();

    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);

    return null;
}

// Custom zoom controls outside MapContainer
function CustomZoomControlsExternal({ mapInstance }: { mapInstance: L.Map | null }) {
    const handleZoomIn = () => mapInstance?.zoomIn();
    const handleZoomOut = () => mapInstance?.zoomOut();
    const handleResetZoom = () => {
        mapInstance?.flyTo([45.9432, 24.9668], 7, { duration: 1.5, easeLinearity: 0.25 });
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
            }}
        >
            <button
                onClick={handleZoomIn}
                style={buttonStyle}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
                title="Zoom In"
            >
                +
            </button>
            <button
                onClick={handleZoomOut}
                style={buttonStyle}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
                title="Zoom Out"
            >
                −
            </button>
            <button
                onClick={handleResetZoom}
                style={buttonStyle}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
                title="Reset View"
            >
                🏠
            </button>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
};

const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
    e.currentTarget.style.transform = 'scale(1.05)';
};
const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
    e.currentTarget.style.transform = 'scale(1)';
};

// Component to handle map clicks
function MapClickHandler({
                             onMapClick,
                             zoomLevel = 15,
                             onMapMove
                         }: {
    onMapClick: (lat: number, lng: number) => void;
    zoomLevel?: number;
    onMapMove?: () => void;
}) {
    const map = useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            map.flyTo([lat, lng], zoomLevel, { duration: 1.5, easeLinearity: 0.25 });
            onMapClick(lat, lng);
        },
        movestart: () => onMapMove?.(),
        zoomstart: () => onMapMove?.(),
    });
    return null;
}

// News markers
function NewsMarker({
                        news,
                        zoomLevel = 16,
                        closePopups
                    }: {
    news: News;
    zoomLevel?: number;
    closePopups?: number;
}) {
    const map = useMap();
    const markerRef = useRef<L.Marker | null>(null);
    const shouldCloseRef = useRef(true);

    useEffect(() => {
        if (markerRef.current && shouldCloseRef.current) {
            markerRef.current.closePopup();
        }
    }, [closePopups]);

    const handleMarkerClick = () => {
        shouldCloseRef.current = false;
        map.flyTo([news.location.lat, news.location.lng], zoomLevel, {
            duration: 1.5,
            easeLinearity: 0.25,
        });
        setTimeout(() => {
            shouldCloseRef.current = true;
        }, 1600);
    };

    return (
        <Marker
            position={[news.location.lat, news.location.lng]}
            eventHandlers={{ click: handleMarkerClick }}
            ref={markerRef}
        >
            <Popup>
                <div style={{ minWidth: '200px' }}>
                    <img
                        src={news.image}
                        alt={news.name}
                        style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginBottom: '8px',
                        }}
                    />
                    <strong style={{ fontSize: '14px' }}>{news.name}</strong>
                    <p style={{ fontSize: '12px', margin: '8px 0', color: '#666' }}>
                        {news.description}
                    </p>
                    <small style={{ fontSize: '10px', color: '#999' }}>
                        📍 {news.location.lat.toFixed(4)}, {news.location.lng.toFixed(4)}
                    </small>
                </div>
            </Popup>
        </Marker>
    );
}

// Main Map component
export default function Map() {
    const position: [number, number] = [45.9432, 24.9668];

    const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);
    const [closePopups, setClosePopups] = useState(0);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

    const isCreatingNews = useRef(false);
    const clickZoomLevel = 16;

    const handleMapClick = (lat: number, lng: number) => {
        setClickedPosition([lat, lng]);
        isCreatingNews.current = true;
        setTimeout(() => {
            isCreatingNews.current = false;
        }, 1600);
    };

    const handleMapMove = () => {
        if (!isCreatingNews.current) setClosePopups((prev) => prev + 1);
    };

    const handleMapReady = useCallback((map: L.Map) => {
        setMapInstance(map);
    }, []);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <MapContainer
                center={position}
                zoom={7}
                style={{ height: '100vh', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <MapInstanceCapture onMapReady={handleMapReady} />

                <MapClickHandler
                    onMapClick={handleMapClick}
                    zoomLevel={clickZoomLevel}
                    onMapMove={handleMapMove}
                />

                {newsData.map((news) => (
                    <NewsMarker
                        key={news.id}
                        news={news}
                        zoomLevel={clickZoomLevel}
                        closePopups={closePopups}
                    />
                ))}

                {/* Marker at clicked position with auto popup & deletion on close */}
                {clickedPosition && (
                    <Marker
                        position={clickedPosition}
                        ref={(marker) => {
                            if (marker) {
                                setTimeout(() => marker.openPopup(), 1200);
                            }
                        }}
                        eventHandlers={{
                            popupclose: () => {
                                setClickedPosition(null);
                            },
                        }}
                    >
                        <Popup>
                            <div>
                                <strong>Post news here?</strong>
                                <br />
                                Lat: {clickedPosition[0].toFixed(4)}
                                <br />
                                Lng: {clickedPosition[1].toFixed(4)}
                                <br />
                                <button
                                    onClick={() =>
                                        alert(
                                            `Posting news at: ${clickedPosition[0]}, ${clickedPosition[1]}`
                                        )
                                    }
                                    style={{
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Post News Here
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            <CustomZoomControlsExternal mapInstance={mapInstance} />
        </div>
    );
}
