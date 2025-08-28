import axios from 'axios';
import { Coordinates, Place } from '../types';
import { config } from '../config/env';

const osrmClient = axios.create({
  baseURL: config.OSRM_BASE_URL
});

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query) return [];
  
  try {
    // Intentar ambos servicios en paralelo para mayor confiabilidad
    const searchPromises: Promise<Place[]>[] = [];
    
    // Siempre intentar Nominatim
    const nominatimPromise = searchWithNominatim(query)
      .catch(error => {
        console.warn('Nominatim search failed:', error);
        return [] as Place[];
      });
    
    searchPromises.push(nominatimPromise);
    
    // También intentar Google Maps si está disponible
    if (config.GOOGLE_MAPS_API_KEY) {
      const googlePromise = searchWithGoogleMaps(query)
        .catch(error => {
          console.warn('Google Maps search failed:', error);
          return [] as Place[];
        });
      
      searchPromises.push(googlePromise);
    }
    
    // Esperar a que ambos terminen o fallen
    const results = await Promise.all(searchPromises);
    
    // Combinar resultados, priorizando Google Maps si hay resultados
    let combinedResults = results.flat();
    
    // Si no hay resultados, devolver un placeholder para debugging
    if (combinedResults.length === 0) {
      console.warn('No search results from any provider');
      return getFallbackResults(query);
    }
    
    return combinedResults;
  } catch (error) {
    console.error('Error al buscar lugares:', error);
    return getFallbackResults(query);
  }
}

// Función de fallback para siempre mostrar algún resultado
function getFallbackResults(query: string): Place[] {
  return [{
    name: `Búsqueda: ${query}`,
    coordinates: { lat: 4.6097, lng: -74.0817 }, // Bogotá (default)
    fullAddress: `No se encontraron resultados para: ${query}`,
    city: 'Ubicación no encontrada',
    state: '',
    country: '',
    placeType: 'unknown',
    displayName: `Sin resultados: ${query}`
  }];
}

async function searchWithNominatim(query: string): Promise<Place[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '8',
    addressdetails: '1',
    namedetails: '1',
    'accept-language': 'es',
    countrycodes: 'co,ve,br,ar,pe,cl,ec,bo,py,uy,gy,sr,gf', // Códigos de países de Sudamérica
    bounded: '1',
    viewbox: '-81.2,-56.0,-34.8,13.4' // Bounding box de Sudamérica
  });

  // Crear AbortController de manera segura
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${config.NOMINATIM_BASE_URL}/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'es',
        'User-Agent': 'AURA-Weather-Route-App/1.0 (+https://aur-a.netlify.app)',
        ...(typeof window !== 'undefined' ? { 'Referer': window.location.origin } : {})
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Nominatim responded with status: ${response.status}`);
      throw new Error(`Error Nominatim: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.warn('Nominatim returned invalid data format');
      return [];
    }

    const places = data.map((result: any) => {
    const name = result.namedetails?.name 
      || result.namedetails?.['name:es'] 
      || result.namedetails?.['name:en']
      || result.name 
      || result.display_name.split(',')[0];

    const addressParts = result.display_name.split(', ');
    const address = addressParts.slice(0, 3).join(', ') + 
      (addressParts.length > 3 ? `, ${addressParts[addressParts.length - 1]}` : '');

    // Extraer información específica del address
    const city = result.address?.city 
      || result.address?.town 
      || result.address?.village 
      || result.address?.municipality
      || addressParts[1]?.trim() || '';

    const state = result.address?.state 
      || result.address?.region 
      || result.address?.province
      || addressParts[2]?.trim() || '';

    const country = result.address?.country || addressParts[addressParts.length - 1]?.trim() || '';

    // Determinar el tipo de lugar
    const placeType = getPlaceType(result.type, result.class, result.address);

    // Crear nombre de display más informativo
    const displayName = createDisplayName(name, city, state, country);

    return {
      name: name,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      fullAddress: address,
      city: city,
      state: state,
      country: country,
      placeType: placeType,
      displayName: displayName
    };
  });

    return places;
  
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Nominatim request timeout');
      throw new Error('Timeout en búsqueda');
    }
    console.error('Error en Nominatim:', error);
    throw error;
  }
}

async function searchWithGoogleMaps(query: string): Promise<Place[]> {
  if (!config.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key no configurada');
    return [];
  }

  try {
    // Intentar primero con la función serverless (en producción)
    if (import.meta.env.PROD) {
      try {
        const params = new URLSearchParams({
          query: query,
          endpoint: 'place/textsearch/json'
        });
        
        const response = await fetch(`/api/maps/search?${params}`);
        if (response.ok) {
          return processGoogleMapsResponse(await response.json());
        }
      } catch (error) {
        console.warn('Error en Google Maps serverless function:', error);
        // Continuar con el método alternativo
      }
    }
    
    // Método alternativo: proxy en netlify.toml
    const params = new URLSearchParams({
      query: query,
      key: config.GOOGLE_MAPS_API_KEY,
      language: 'es',
      region: 'co', // Colombia como región base
      location: '-8.7832,-55.4915', // Centro de Sudamérica (Brasil)
      radius: '5000000' // 5000 km de radio (cubre toda Sudamérica)
    });

    const response = await fetch(`${config.GOOGLE_MAPS_BASE_URL}/place/textsearch/json?${params}`);
    
    if (!response.ok) {
      console.warn(`Google Maps responded with status: ${response.status}`);
      throw new Error(`Error Google Maps: ${response.status}`);
    }

    const data = await response.json();
    return processGoogleMapsResponse(data);
  } catch (error) {
    console.error('Error en Google Maps search:', error);
    return [];
  }
}

// Función para procesar respuestas de Google Maps de manera consistente
function processGoogleMapsResponse(data: any): Place[] {
  if (!data || data.status !== 'OK') {
    console.warn(`Google Maps API status: ${data?.status}`, data?.error_message);
    return [];
  }
  
  if (!Array.isArray(data.results)) {
    console.warn('Google Maps returned invalid data format');
    return [];
  }

  // Filtrar resultados para asegurar que estén en Sudamérica
  const southAmericaResults = data.results.filter((result: any) => {
    try {
      const lat = result.geometry?.location?.lat;
      const lng = result.geometry?.location?.lng;
      
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return false;
      }
      
      // Coordenadas aproximadas de Sudamérica
      return lat >= -56.0 && lat <= 13.4 && lng >= -81.2 && lng <= -34.8;
    } catch (error) {
      console.warn('Error filtering result:', error);
      return false;
    }
  });

  const mappedResults = southAmericaResults.slice(0, 8).map((result: any) => {
    try {
      const name = result.name || '';
      const fullAddress = result.formatted_address || '';
      
      // Extraer información de la dirección formateada
      const addressParts = fullAddress.split(', ');
      const country = addressParts[addressParts.length - 1] || '';
      const state = addressParts[addressParts.length - 2] || '';
      const city = addressParts[addressParts.length - 3] || addressParts[0] || '';
      
      // Determinar tipo de lugar basado en Google Places types
      const placeType = getGooglePlaceType(result.types);
      
      // Crear display name
      const displayName = createDisplayName(name, city, state, country);
      
      return {
        name: name,
        coordinates: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0
        },
        fullAddress: fullAddress,
        city: city,
        state: state,
        country: country,
        placeType: placeType,
        displayName: displayName
      };
    } catch (error) {
      console.warn('Error processing Google Maps result:', error);
      return null;
    }
  });
  
  // Filtrar elementos nulos
  return mappedResults.filter((place: Place | null): place is Place => place !== null);
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
    // En producción, priorizar Google Maps para mayor confiabilidad
    if (import.meta.env.PROD && config.GOOGLE_MAPS_API_KEY) {
      return await getLocationNameFromGoogleMaps(coordinates);
    }
    
    // Intentar con Nominatim primero (desarrollo o fallback)
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
        'accept-language': 'es',
        zoom: '10' // Nivel de zoom para obtener ciudades
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
        // Priorizar nombres de ciudades y áreas pobladas
        const cityName = address.city || 
                        address.town || 
                        address.village || 
                        address.municipality || 
                        address.suburb ||
                        address.hamlet ||
                        address.neighbourhood ||
                        address.county ||
                        address.state_district ||
                        address.state;
        
        // Si encontramos un nombre válido, devolverlo
        if (cityName && cityName.trim()) {
          return cityName.trim();
        }
      }
      
      // Si no hay datos válidos, intentar con display_name simplificado
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        if (parts.length > 0) {
          const firstPart = parts[0].trim();
          if (firstPart && firstPart.length > 0) {
            return firstPart;
          }
        }
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
    region: 'co', // Colombia como región base
    result_type: 'locality|administrative_area_level_2|administrative_area_level_1' // Solo ciudades y áreas administrativas
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  
  if (!response.ok) {
    throw new Error(`Error Google Maps: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status === 'OK' && data.results.length > 0) {
    const result = data.results[0];
    
    // Buscar componentes de ciudad en orden de prioridad
    const cityComponent = result.address_components.find((component: any) => 
      component.types.includes('locality')
    );
    
    const townComponent = result.address_components.find((component: any) => 
      component.types.includes('administrative_area_level_2')
    );
    
    const stateComponent = result.address_components.find((component: any) => 
      component.types.includes('administrative_area_level_1')
    );
    
    // Devolver el nombre más específico disponible
    if (cityComponent) {
      return cityComponent.long_name;
    } else if (townComponent) {
      return townComponent.long_name;
    } else if (stateComponent) {
      return stateComponent.long_name;
    } else {
      // Como último recurso, usar la primera parte de la dirección formateada
      const firstPart = result.formatted_address.split(',')[0].trim();
      return firstPart || 'Punto en ruta';
    }
  }
  
  return 'Punto en ruta';
}

// Función auxiliar para determinar el tipo de lugar
function getPlaceType(type: string, className: string, address: any): string {
  if (address?.amenity) {
    const amenityTypes: Record<string, string> = {
      'restaurant': '🍽️ Restaurante',
      'hotel': '🏨 Hotel',
      'hospital': '🏥 Hospital',
      'school': '🏫 Escuela',
      'university': '🎓 Universidad',
      'bank': '🏦 Banco',
      'gas_station': '⛽ Gasolinera',
      'pharmacy': '💊 Farmacia',
      'police': '👮 Policía',
      'fire_station': '🚒 Bomberos',
      'post_office': '📮 Correo',
      'library': '📚 Biblioteca',
      'cinema': '🎬 Cine',
      'theatre': '🎭 Teatro',
      'museum': '🏛️ Museo',
      'shopping_mall': '🛍️ Centro Comercial',
      'supermarket': '🛒 Supermercado',
      'cafe': '☕ Café',
      'bar': '🍺 Bar',
      'fuel': '⛽ Gasolinera'
    };
    return amenityTypes[address.amenity] || '📍 Lugar';
  }

  if (address?.tourism) {
    const tourismTypes: Record<string, string> = {
      'hotel': '🏨 Hotel',
      'museum': '🏛️ Museo',
      'attraction': '🎯 Atracción',
      'viewpoint': '👁️ Mirador',
      'monument': '🗿 Monumento',
      'park': '🌳 Parque'
    };
    return tourismTypes[address.tourism] || '🎯 Turismo';
  }

  if (className === 'place') {
    const placeTypes: Record<string, string> = {
      'city': '🏙️ Ciudad',
      'town': '🏘️ Pueblo',
      'village': '🏡 Villa',
      'municipality': '🏛️ Municipio',
      'neighbourhood': '🏘️ Barrio',
      'suburb': '🏘️ Suburbio',
      'district': '📍 Distrito',
      'quarter': '📍 Sector'
    };
    return placeTypes[type] || '📍 Lugar';
  }

  if (className === 'highway') {
    return '🛣️ Carretera';
  }

  if (className === 'natural') {
    const naturalTypes: Record<string, string> = {
      'beach': '🏖️ Playa',
      'mountain': '⛰️ Montaña',
      'lake': '🏞️ Lago',
      'river': '🏊 Río',
      'forest': '🌲 Bosque',
      'park': '🌳 Parque'
    };
    return naturalTypes[type] || '🌿 Natural';
  }

  return '📍 Lugar';
}

// Función auxiliar para determinar el tipo de lugar de Google Places
function getGooglePlaceType(types: string[]): string {
  const typeMap: Record<string, string> = {
    'restaurant': '🍽️ Restaurante',
    'lodging': '🏨 Hotel',
    'hospital': '🏥 Hospital',
    'school': '🏫 Escuela',
    'university': '🎓 Universidad',
    'bank': '🏦 Banco',
    'gas_station': '⛽ Gasolinera',
    'pharmacy': '💊 Farmacia',
    'police': '👮 Policía',
    'fire_station': '🚒 Bomberos',
    'post_office': '📮 Correo',
    'library': '📚 Biblioteca',
    'movie_theater': '🎬 Cine',
    'museum': '🏛️ Museo',
    'shopping_mall': '🛍️ Centro Comercial',
    'supermarket': '🛒 Supermercado',
    'cafe': '☕ Café',
    'bar': '🍺 Bar',
    'airport': '✈️ Aeropuerto',
    'subway_station': '🚇 Metro',
    'bus_station': '🚌 Terminal',
    'train_station': '🚂 Estación',
    'tourist_attraction': '🎯 Atracción',
    'park': '🌳 Parque',
    'church': '⛪ Iglesia',
    'mosque': '🕌 Mezquita',
    'synagogue': '🕍 Sinagoga',
    'spa': '💆 Spa',
    'gym': '💪 Gimnasio',
    'store': '🏪 Tienda',
    'locality': '🏙️ Ciudad',
    'administrative_area_level_1': '📍 Estado',
    'administrative_area_level_2': '📍 Provincia',
    'country': '🌍 País'
  };

  // Buscar el tipo más específico
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  // Fallbacks por categoría
  if (types.includes('establishment')) return '🏢 Establecimiento';
  if (types.includes('point_of_interest')) return '📍 Punto de Interés';
  if (types.includes('natural_feature')) return '🌿 Natural';
  
  return '📍 Lugar';
}

// Función auxiliar para crear nombre de display informativo
function createDisplayName(name: string, city: string, state: string, country: string): string {
  const parts = [name];
  
  if (city && city !== name) {
    parts.push(city);
  }
  
  if (state && state !== city && state !== name) {
    parts.push(state);
  }
  
  if (country) {
    parts.push(country);
  }
  
  return parts.slice(0, 3).join(', ');
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
