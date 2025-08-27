import { config } from '../config/env';

import { loadGoogleMaps } from '../utils/loadGoogleMaps';
import { Place } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query) return [];
  
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'mx', // Limitando a México
    addressdetails: '1'
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'Accept-Language': 'es'
    }
  });

  if (!response.ok) {
    throw new Error('Error al buscar lugares');
  }

  const results = await response.json();
  
  return results.map((result: any) => ({
    id: result.place_id.toString(),
    name: result.display_name,
    coordinates: {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    },
    address: result.display_name
  }));
}

export async function getPlaceDetails(placeId: string): Promise<Place | null> {
  const response = await fetch(`${NOMINATIM_BASE_URL}/details?place_id=${placeId}&format=json`);
  
  if (!response.ok) {
    throw new Error('Error al obtener detalles del lugar');
  }

  const result = await response.json();
  
  return {
    id: placeId,
    name: result.name || result.display_name,
    coordinates: {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    },
    address: result.display_name
  };
}

export async function getRoute(origin: Place, destination: Place): Promise<{
  points: Array<{ coordinates: { lat: number; lng: number } }>;
  distance: number;
  duration: number;
}> {
  // Usando OSRM (Open Source Routing Machine) para obtener la ruta
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.coordinates.lng},${origin.coordinates.lat};${destination.coordinates.lng},${destination.coordinates.lat}?overview=full&geometries=polyline&steps=true`;
  
  const response = await fetch(osrmUrl);
  
  if (!response.ok) {
    throw new Error('Error al obtener la ruta');
  }

  const data = await response.json();
  
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No se encontró una ruta');
  }

  const route = data.routes[0];
  const points = decodePolyline(route.geometry).map(([lat, lng]) => ({
    coordinates: { lat, lng }
  }));

  return {
    points,
    distance: route.distance, // en metros
    duration: route.duration // en segundos
  };
}

// Función auxiliar para decodificar la polyline de OSRM
function decodePolyline(str: string, precision = 5) {
  let index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null;

  const factor = Math.pow(10, precision);

  // Decode polyline
  while (index < str.length) {
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}
