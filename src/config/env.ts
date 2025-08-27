// Definición del tipo de configuración
interface Config {
  GOOGLE_MAPS_API_KEY: string;
  OPENWEATHER_API_KEY: string;
  OPENWEATHER_BASE_URL: string;
  NOMINATIM_BASE_URL: string;
  OSRM_BASE_URL: string;
  WEATHER_UNITS: string;
}

// Exportar la configuración
export const config: Config = {
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  NOMINATIM_BASE_URL: import.meta.env.PROD ? 'https://nominatim.openstreetmap.org' : '/nominatim',
  OSRM_BASE_URL: import.meta.env.PROD ? 'https://router.project-osrm.org' : '/osrm',
  WEATHER_UNITS: 'metric' // Celsius
};

// Función para validar la configuración
export function validateConfig(): boolean {
  const requiredKeys = {
    'Google Maps': config.GOOGLE_MAPS_API_KEY,
    'OpenWeather': config.OPENWEATHER_API_KEY
  };

  let isValid = true;
  for (const [service, key] of Object.entries(requiredKeys)) {
    if (!key) {
      console.warn(`La API key de ${service} no está configurada.`);
      isValid = false;
    }
  }
  
  return isValid;
}
