import { config } from '../config/env';

declare global {
  interface Window {
    google: any;
  }
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export class PlacesService {
  private static getAutocompleteService() {
    return new window.google.maps.places.AutocompleteService();
  }

  private static getPlacesService() {
    return new window.google.maps.places.PlacesService(document.createElement('div'));
  }

  static async getAutocompleteSuggestions(
    input: string,
    searchType: 'all' | 'cities' | 'countries' = 'all'
  ): Promise<PlacePrediction[]> {
    try {
      if (!input || input.length < 2) {
        return [];
      }

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

      const service = this.getAutocompleteService();
      
      const predictions = await new Promise<PlacePrediction[]>((resolve, reject) => {
        service.getPlacePredictions(
          {
            input,
            types,
            componentRestrictions,
            language: 'es',
          },
          (results: any[], status: string) => {
            if (status === 'OK') {
              const formatted = results.map(result => ({
                place_id: result.place_id,
                description: result.description,
                structured_formatting: {
                  main_text: result.structured_formatting.main_text,
                  secondary_text: result.structured_formatting.secondary_text,
                },
              }));
              resolve(formatted);
            } else {
              resolve([]);
            }
          }
        );
      });

      return predictions;
    } catch (error) {
      console.error('Error obteniendo sugerencias de autocompletado:', error);
      return [];
    }
  }

  static async getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const service = this.getPlacesService();
      
      const result = await new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ['geometry'],
          },
          (place: any, status: string) => {
            if (status === 'OK' && place && place.geometry) {
              resolve({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            } else {
              resolve(null);
            }
          }
        );
      });

      return result as { lat: number; lng: number } | null;
    } catch (error) {
      console.error('Error obteniendo detalles del lugar:', error);
      return null;
    }
  }
}
