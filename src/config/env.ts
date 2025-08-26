// Configuración de variables de entorno
export const config = {
  // API Keys
  GOOGLE_MAPS_API_KEY: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'TU_API_KEY_DE_GOOGLE_MAPS',
  OPENWEATHER_API_KEY: (import.meta as any).env?.VITE_OPENWEATHER_API_KEY || 'TU_API_KEY_DE_OPENWEATHER',
  
  // Configuración de la aplicación
  APP_NAME: (import.meta as any).env?.VITE_APP_NAME || 'AURA',
  APP_DESCRIPTION: (import.meta as any).env?.VITE_APP_DESCRIPTION || 'Pronóstico de Clima en Ruta',
  
  // URLs de las APIs
  GOOGLE_MAPS_BASE_URL: 'https://maps.googleapis.com/maps/api',
  GOOGLE_PLACES_BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  
  // Configuración del mapa
  DEFAULT_MAP_CENTER: {
    lat: 19.4326, // México City
    lng: -99.1332
  },
  DEFAULT_ZOOM: 10,
  
  // Configuración de la ruta
  ROUTE_POINTS_COUNT: 10, // Número de puntos a analizar en la ruta
  
  // Configuración del clima
  WEATHER_UNITS: 'metric', // metric, imperial, kelvin
  WEATHER_LANG: 'es' // Código de idioma para las descripciones
};

// Validación de configuración
export const validateConfig = () => {
  const requiredKeys = [
    'GOOGLE_MAPS_API_KEY',
    'OPENWEATHER_API_KEY'
  ];
  
  const missingKeys = requiredKeys.filter(key => 
    !config[key as keyof typeof config] || 
    config[key as keyof typeof config] === `TU_API_KEY_DE_${key.split('_')[2]}`
  );
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ API Keys faltantes:', missingKeys);
    console.warn('Por favor, configura las API keys en el archivo .env o en src/services/api.ts');
    return false;
  }
  
  return true;
};
