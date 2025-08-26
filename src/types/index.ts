// Tipos para las coordenadas geográficas
export interface Coordinates {
  lat: number;
  lng: number;
}

// Tipos para los datos de ruta
export interface RoutePoint {
  coordinates: Coordinates;
  arrivalTime: Date;
  distance: number;
  duration: number;
}

export interface RouteData {
  points: RoutePoint[];
  totalDistance: number;
  totalDuration: number;
  polyline: string;
}

// Tipos para el clima
export interface WeatherData {
  coordinates: Coordinates;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  arrivalTime: Date;
}

export interface WeatherPoint {
  coordinates: Coordinates;
  weather: WeatherData;
  arrivalTime: Date;
}

// Tipos para las APIs
export interface GoogleMapsResponse {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: Array<{
        polyline: { points: string };
        distance: { value: number };
        duration: { value: number };
      }>;
    }>;
    overview_polyline: { points: string };
  }>;
}

export interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
}

// Tipos para el estado de la aplicación
export interface AppState {
  origin: string;
  destination: string;
  routeData: RouteData | null;
  weatherPoints: WeatherPoint[];
  loading: boolean;
  error: string | null;
}
