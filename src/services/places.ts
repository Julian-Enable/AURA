import axios from 'axios';
import { config } from '../config/env';

// Cliente para Google Places API
const placesClient = axios.create({
  baseURL: config.GOOGLE_PLACES_BASE_URL,
});

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlacesAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export class PlacesService {
  static async getAutocompleteSuggestions(input: string, searchType: 'all' | 'cities' | 'countries' = 'all'): Promise<PlacePrediction[]> {
    try {
      if (!input || input.length < 2) {
        return [];
      }

      // Configurar tipos de búsqueda según el parámetro
      let types = '(regions)'; // Por defecto incluye países, estados, ciudades
      let components = undefined;

      switch (searchType) {
        case 'cities':
          types = '(cities)';
          components = 'country:mx'; // Priorizar ciudades de México
          break;
        case 'countries':
          types = '(regions)'; // regions incluye países
          break;
        case 'all':
        default:
          types = '(regions)'; // Incluye países, estados, ciudades
          break;
      }

      const response = await placesClient.get<PlacesAutocompleteResponse>('/autocomplete/json', {
        params: {
          input,
          key: config.GOOGLE_MAPS_API_KEY,
          types,
          language: 'es', // Español
          ...(components && { components }), // Solo incluir components si está definido
        },
      });

      if (response.data.status === 'OK') {
        return response.data.predictions;
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo sugerencias de autocompletado:', error);
      return [];
    }
  }

  static async getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await placesClient.get('/details/json', {
        params: {
          place_id: placeId,
          key: config.GOOGLE_MAPS_API_KEY,
          fields: 'geometry',
        },
      }); 

      if (response.data.status === 'OK' && response.data.result.geometry) {
        const { lat, lng } = response.data.result.geometry.location;
        return { lat, lng };
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo detalles del lugar:', error);
      return null;
    }
  }
}
