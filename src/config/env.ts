// Definición del tipo de configuración
interface Config {
  OPENWEATHER_API_KEY: string;
}

// Exportar la configuración
export const config: Config = {
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
};

// Función para validar la configuración
export function validateConfig(): boolean {
  if (!config.OPENWEATHER_API_KEY) {
    console.warn('La API key de OpenWeather no está configurada.');
    return false;
  }
  return true;
}
