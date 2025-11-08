/**
 * Reverse geocoding using Nominatim API (OpenStreetMap)
 * Converts coordinates to human-readable address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MOPS-Incident-Reporter',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Forward geocoding using Nominatim API (OpenStreetMap)
 * Converts address to coordinates
 */
export async function forwardGeocode(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (!address || address.trim().length < 3) {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'MOPS-Incident-Reporter',
        },
      }
    );

    if (!response.ok) {
      console.error('Forward geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return null;
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number
): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

