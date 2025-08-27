import axios from 'axios';
import { Coordinates, Place } from '../types';
import { config } from '../config/env';

const osrmClient = axios.create({
  baseURL: config.OSRM_BASE_URL
});

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query) return [];
  
  try {
    // Intentar con Nominatim primero
    const nominatimResults = await searchWithNominatim(query);
    if (nominatimResults.length > 0) {
      return nominatimResults;
    }
    
    // Si Nominatim falla, usar Google Maps como backup
    return await searchWithGoogleMaps(query);
  } catch (error) {
    console.error('Error al buscar lugares:', error);
    // Fallback a Google Maps si Nominatim falla
    try {
      return await searchWithGoogleMaps(query);
    } catch (googleError) {
      console.error('Error al buscar lugares con Google Maps:', googleError);
      return [];
    }
  }
}

async function searchWithNominatim(query: string): Promise<Place[]> {
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
    throw new Error(`Error Nominatim: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
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
}

async function searchWithGoogleMaps(query: string): Promise<Place[]> {
  if (!config.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key no configurada');
    return [];
  }

  const params = new URLSearchParams({
    query: query,
    key: config.GOOGLE_MAPS_API_KEY,
    language: 'es',
    region: 'co' // Colombia
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  
  if (!response.ok) {
    throw new Error(`Error Google Maps: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK' || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.slice(0, 8).map((result: any) => ({
    name: result.name,
    coordinates: {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng
    },
    fullAddress: result.formatted_address
  }));
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
  try {
    // Intentar con Nominatim primero
    const nominatimName = await getLocationNameFromNominatim(coordinates);
    if (nominatimName !== 'Punto en ruta') {
      return nominatimName;
    }
    
    // Si Nominatim falla, usar Google Maps
    return await getLocationNameFromGoogleMaps(coordinates);
  } catch (error) {
    console.error('Error obteniendo nombre de ubicación:', error);
    try {
      return await getLocationNameFromGoogleMaps(coordinates);
    } catch (googleError) {
      console.error('Error con Google Maps:', googleError);
      return 'Punto en ruta';
    }
  }
}

async function getLocationNameFromNominatim(coordinates: Coordinates): Promise<string> {
  const maxRetries = 2;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
      console.warn(`Nominatim intento ${attempt} fallido:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  return 'Punto en ruta';
}

async function getLocationNameFromGoogleMaps(coordinates: Coordinates): Promise<string> {
  if (!config.GOOGLE_MAPS_API_KEY) {
    return 'Punto en ruta';
  }

  const params = new URLSearchParams({
    latlng: `${coordinates.lat},${coordinates.lng}`,
    key: config.GOOGLE_MAPS_API_KEY,
    language: 'es',
    region: 'co'
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  
  if (!response.ok) {
    throw new Error(`Error Google Maps: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    const result = data.results[0];
    // Buscar la ciudad en los componentes de dirección
    const cityComponent = result.address_components.find((component: any) => 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_2')
    );
    
    return cityComponent ? cityComponent.long_name : result.formatted_address.split(',')[0];
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
