import { config } from '../config/env';

import { loadGoogleMaps } from '../utils/loadGoogleMaps';

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export class PlacesService {
  static async getAutocompleteSuggestions(
    input: string,
    searchType: 'all' | 'cities' | 'countries' = 'all'
  ): Promise<PlacePrediction[]> {
    try {
      if (!input || input.length < 2) {
        return [];
      }

      const places = await loadGoogleMaps();
      
      // Configurar los parámetros de búsqueda
      let types: string[];
      let componentRestrictions: { country?: string } = {};

      switch (searchType) {
        case 'cities':
          types = ['(cities)'];
          componentRestrictions = { country: 'mx' };
          break;
        case 'countries':
          types = ['(regions)'];
          break;
        case 'all':
        default:
          types = ['(regions)'];
          break;
      }

      // Usar la nueva API de Places
      const request = {
        input,
        types,
        componentRestrictions,
        language: 'es',
      };

      const response = await places.searchByText(request);
      
      return response.predictions.map(result => ({
        place_id: result.place_id,
        description: result.description,
        structured_formatting: {
          main_text: result.structured_formatting.main_text,
          secondary_text: result.structured_formatting.secondary_text,
        },
      }));
    } catch (error) {
      console.error('Error obteniendo sugerencias de autocompletado:', error);
      return [];
    }
  }

  static async getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const places = await loadGoogleMaps();
      
      const request = {
        placeId,
        fields: ['geometry']
      };

      const place = await places.fetchFields(request);
      
      if (place && place.geometry?.location) {
        return {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo detalles del lugar:', error);
      return null;
    }
  }
}
