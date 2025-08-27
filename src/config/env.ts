// Configuración de variables de entorno
export const config = {
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY as string,
};

if (!config.OPENWEATHER_API_KEY) {
  throw new Error('La API key de OpenWeather es requerida.');
}
