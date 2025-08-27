import { config } from '../config/env';

declare global {
  interface Window {
    google: any;
  }
}

let placesPromise: Promise<any> | null = null;

export const loadGoogleMaps = async () => {
  if (!placesPromise) {
    // Cargar la biblioteca de Maps
    const { importLibrary } = await import('@googlemaps/js-api-loader');
    
    // Cargar específicamente la biblioteca de Places
    placesPromise = importLibrary('places')
      .then(async (places) => {
        console.log('Places library loaded successfully');
        return places;
      })
      .catch((error) => {
        console.error('Error loading Places library:', error);
        throw error;
      });
  }
  
  return placesPromise;
};
