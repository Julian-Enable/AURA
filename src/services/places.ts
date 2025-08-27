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

      const maps = await loadGoogleMaps();
      const autocompleteService = new maps.places.AutocompleteService();
      
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

      const request = {
        input,
        types,
        componentRestrictions,
        language: 'es',
      };

      const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
        autocompleteService.getPlacePredictions(request, (results) => {
          resolve(results || []);
        });
      });
      
      return predictions.map(result => ({
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
      const maps = await loadGoogleMaps();
      const placesService = new maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        placeId,
        fields: ['geometry']
      };

      const place = await new Promise((resolve) => {
        placesService.getDetails(request, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            resolve(null);
          }
        });
      });
      
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
