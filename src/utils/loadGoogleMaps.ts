import { config } from '../config/env';

let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMaps = (): Promise<void> => {
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.google?.maps) {
      resolve();
      return;
    }

    // Callback cuando Google Maps se cargue
    window.initGoogleMaps = () => {
      resolve();
    };

    // Crear y añadir el script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      reject(new Error('Error al cargar Google Maps'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Declarar el callback global
declare global {
  interface Window {
    initGoogleMaps: () => void;
    google: any;
  }
}
