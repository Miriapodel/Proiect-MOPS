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

// Incident type definition
interface Incident {
    id: string;
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string | null;
    photos: string[];
    status: string;
    createdAt: string; // ISO string instead of Date
    user: {
        firstName: string;
        lastName: string;
    };
}

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

// Get status badge color
function getStatusColor(status: string) {
    const colors = {
        PENDING: '#fbbf24',
        IN_PROGRESS: '#3b82f6',
        RESOLVED: '#10b981',
        REJECTED: '#ef4444',
    };
    return colors[status as keyof typeof colors] || '#fbbf24';
}

// Incident markers
function IncidentMarker({
                        incident,
                        zoomLevel = 16,
                        closePopups
                    }: {
    incident: Incident;
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
        map.flyTo([incident.latitude, incident.longitude], zoomLevel, {
            duration: 1.5,
            easeLinearity: 0.25,
        });
        setTimeout(() => {
            shouldCloseRef.current = true;
        }, 1600);
    };

    return (
        <Marker
            position={[incident.latitude, incident.longitude]}
            eventHandlers={{ click: handleMarkerClick }}
            ref={markerRef}
        >
            <Popup maxWidth={300}>
                <div style={{ minWidth: '250px' }}>
                    {/* Status Badge */}
                    <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(incident.status),
                        marginBottom: '8px'
                    }}>
                        {incident.status}
                    </div>

                    {/* Category */}
                    <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        margin: '8px 0',
                        color: '#166534'
                    }}>
                        {incident.category}
                    </h3>

                    {/* Photo */}
                    {incident.photos.length > 0 && (
                        <img
                            src={incident.photos[0]}
                            alt="Incident"
                            style={{
                                width: '100%',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '8px',
                            }}
                        />
                    )}

                    {/* Description */}
                    <p style={{ 
                        fontSize: '13px', 
                        margin: '8px 0', 
                        color: '#4b5563',
                        lineHeight: '1.4'
                    }}>
                        {incident.description.length > 100 
                            ? incident.description.substring(0, 100) + '...' 
                            : incident.description}
                    </p>

                    {/* Reported by */}
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '8px 0'
                    }}>
                        👤 <strong>{incident.user.firstName} {incident.user.lastName}</strong>
                    </p>

                    {/* Address */}
                    {incident.address && (
                        <p style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            margin: '4px 0'
                        }}>
                            📍 {incident.address}
                        </p>
                    )}

                    {/* Coordinates */}
                    <small style={{ fontSize: '10px', color: '#d1d5db' }}>
                        Coords: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                    </small>
                </div>
            </Popup>
        </Marker>
    );
}

// Main Map component
export default function Map({ incidents }: { incidents: Incident[] }) {
    // Calculate center based on incidents or use default
    const getMapCenter = (): [number, number] => {
        if (incidents.length === 0) return [45.9432, 24.9668]; // Brașov, Romania default
        
        const avgLat = incidents.reduce((sum, inc) => sum + inc.latitude, 0) / incidents.length;
        const avgLng = incidents.reduce((sum, inc) => sum + inc.longitude, 0) / incidents.length;
        return [avgLat, avgLng];
    };

    const position = getMapCenter();

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

                {incidents.map((incident) => (
                    <IncidentMarker
                        key={incident.id}
                        incident={incident}
                        zoomLevel={clickZoomLevel}
                        closePopups={closePopups}
                    />
                ))}

                {/* Marker at clicked position - View location details */}
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
                                <strong>Location Details</strong>
                                <br />
                                Lat: {clickedPosition[0].toFixed(6)}
                                <br />
                                Lng: {clickedPosition[1].toFixed(6)}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            <CustomZoomControlsExternal mapInstance={mapInstance} />
        </div>
    );
}
