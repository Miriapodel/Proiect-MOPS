'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
if (typeof window !== 'undefined') {
  // Create a simple blue marker
  const markerIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNTk2IDAgMCA1LjU5NiAwIDEyLjVjMCAxLjg2Ny40MiAzLjYzMiAxLjE1OCA1LjIxNUwxMi41IDQxbDExLjM0Mi0yMy4yODVBMTIuNDM0IDEyLjQzNCAwIDAwMjUgMTIuNUMyNSA1LjU5NiAxOS40MDQgMCAxMi41IDB6IiBmaWxsPSIjMzM4OGZmIi8+PGNpcmNsZSBjeD0iMTIuNSIgY3k9IjEyLjUiIHI9IjcuNSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz//9n3Vn3YpskNJkCMcmZC8zQz1hm1U5TJZrWYEh+6NrGqiEZaIjpP8a2BgqgpIhBXNZr9Z5cq5e+SKTB2TKD9Ox8Dh1B2mq3R2dYB5XNqcSB5F8t4pOCYBJiZa8cC6L3a7cPuOWNs12OP8hj3cP0R0HbKmYAAAAAElFTkSuQmCC',
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = markerIcon;
}

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function MapPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Set a timeout to stop showing loading state
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    // Request user's current location on mount
    if (navigator.geolocation && latitude === 45.9432 && longitude === 24.9668) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    return () => clearTimeout(loadingTimeout);
  }, []);

  // Don't render map on server
  if (!isClient) {
    return (
      <div className="map-container flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="text-gray-600">Initializing map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="map-container flex flex-col items-center justify-center bg-gray-100 p-6">
        <p className="text-red-600 mb-2">Map failed to load</p>
        <p className="text-sm text-gray-600 mb-4">Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
        <button
          onClick={() => {
            setMapError(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 2000);
          }}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="map-container relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="text-gray-600">Loading map tiles...</p>
          </div>
        </div>
      )}
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        className="h-full w-full"
        key={`${latitude}-${longitude}`}
        whenReady={() => {
          console.log('Map container is ready');
          // Give tiles time to load
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={1}
          eventHandlers={{
            loading: () => {
              console.log('Tiles are loading...');
            },
            load: () => {
              console.log('Tiles loaded successfully');
              setIsLoading(false);
            },
            tileerror: (error) => {
              console.error('Tile loading error:', error);
              // Don't set error immediately - tiles might retry
              setTimeout(() => {
                if (isLoading) {
                  setMapError(true);
                  setIsLoading(false);
                }
              }, 3000);
            },
          }}
        />
        <Marker position={[latitude, longitude]} />
        <LocationMarker onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}

