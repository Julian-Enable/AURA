import { config } from '../config/env';
import { Loader } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    google: any;
  }
}

let mapsPromise: Promise<typeof google.maps> | null = null;

export const loadGoogleMaps = async () => {
  if (!mapsPromise) {
    const loader = new Loader({
      apiKey: config.GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    mapsPromise = loader.load();
  }
  
  await mapsPromise;
  return window.google.maps;
};
