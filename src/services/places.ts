import axios from 'axios';
import { Coordinates, Place } from '../types';
import { config } from '../config/env';

const osrmClient = axios.create({
  baseURL: config.OSRM_BASE_URL
});

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query) return [];
  
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '8',
      addressdetails: '1',
      namedetails: '1',
      'accept-language': 'es'
    });

    const response = await fetch(`${config.NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'AURA_Weather_Route_App/1.0',
        'Referer': window.location.origin
      }
    });

    if (!response.ok) {
      const errorMessage = `Error al buscar lugares: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Error al procesar la respuesta JSON:', error);
      throw new Error('Error al procesar la respuesta del servidor');
    }

    if (!Array.isArray(data)) {
      console.warn('La respuesta no es un array:', data);
      return [];
    }

    return data.map((result: any) => {
      const name = result.namedetails?.name 
        || result.namedetails?.['name:es'] 
        || result.namedetails?.['name:en']
        || result.name 
        || result.display_name.split(',')[0];

      const addressParts = result.display_name.split(', ');
      const address = addressParts.slice(0, 3).join(', ') + 
        (addressParts.length > 3 ? `, ${addressParts[addressParts.length - 1]}` : '');

      return {
        name: name,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        },
        fullAddress: address
      };
    });
  } catch (error) {
    console.error('Error al buscar lugares:', error);
    return [];
  }
}

export async function getPlaceDetails(query: string): Promise<Place | null> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      'accept-language': 'es'
    });

    const response = await fetch(`${config.NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'AURA_Weather_Route_App/1.0',
        'Referer': window.location.origin
      }
    });

    if (!response.ok) {
      throw new Error('Error buscando lugar');
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const place = data[0];
      return {
        name: place.display_name.split(',')[0],
        coordinates: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        },
        fullAddress: place.display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error buscando lugar:', error);
    return null;
  }
}

// Función auxiliar para esperar un tiempo
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener el nombre de ubicación con reintentos
export async function getLocationName(coordinates: Coordinates): Promise<string> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 segundo entre reintentos

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Esperar antes de cada intento (excepto el primero)
      if (attempt > 1) {
        await delay(retryDelay);
      }

      const params = new URLSearchParams({
        lat: coordinates.lat.toString(),
        lon: coordinates.lng.toString(),
        format: 'json',
        'accept-language': 'es'
      });

      const response = await fetch(`${config.NOMINATIM_BASE_URL}/reverse?${params}`, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'AURA_Weather_Route_App/1.0',
          'Referer': window.location.origin
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.address) {
        const address = data.address;
        return address.city || 
               address.town || 
               address.village || 
               address.municipality || 
               address.suburb ||
               'Punto en ruta';
      }
      return 'Punto en ruta';
    } catch (error) {
      console.warn(`Intento ${attempt} fallido:`, error);
      if (attempt === maxRetries) {
        console.error('Se agotaron los reintentos para obtener el nombre de ubicación');
        return 'Punto en ruta';
      }
    }
  }
  return 'Punto en ruta';
}

export async function getRoute(origin: Place, destination: Place) {
  try {
    const response = await osrmClient.get(`/route/v1/driving/${origin.coordinates.lng},${origin.coordinates.lat};${destination.coordinates.lng},${destination.coordinates.lat}`, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    });

    if (response.data.code !== 'Ok') {
      throw new Error('No se pudo calcular la ruta');
    }

    const route = response.data.routes[0];
    const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
      lat: coord[1],
      lng: coord[0]
    }));

    return {
      points: coordinates.map((coord: Coordinates) => ({
        coordinates: coord,
        arrivalTime: new Date(),
        distance: 0,
        duration: 0
      })),
      distance: route.distance,
      duration: route.duration
    };
  } catch (error) {
    console.error('Error obteniendo ruta:', error);
    
    // Mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        throw new Error('Error de acceso al servidor. Por favor, inténtalo más tarde.');
      }
      if (error.message.includes('Network Error')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
    }
    
    throw new Error('No se pudo obtener la ruta. Por favor, inténtalo de nuevo.');
  }
}
