import axios from 'axios';
import polyline from '@mapbox/polyline';
import { GoogleMapsResponse, OpenWeatherResponse, RouteData, WeatherData, Coordinates } from '../types';
import { config } from '../config/env';

// Cliente axios para Google Maps
const googleMapsClient = axios.create({
  baseURL: config.GOOGLE_MAPS_BASE_URL,
});

// Cliente axios para OpenWeather
const openWeatherClient = axios.create({
  baseURL: config.OPENWEATHER_BASE_URL,
});

export class RouteService {
  /**
   * Obtiene la ruta entre dos puntos usando Google Maps Directions API
   */
  static async getRoute(origin: string, destination: string): Promise<RouteData> {
    try {
      const response = await googleMapsClient.get<GoogleMapsResponse>('/directions/json', {
        params: {
          origin,
          destination,
          key: config.GOOGLE_MAPS_API_KEY,
        },
      });

      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      // Decodificar la polyline para obtener todos los puntos de la ruta
      const decodedPolyline = polyline.decode(route.overview_polyline.points);
      
      // Convertir a formato de coordenadas
      const coordinates: Coordinates[] = decodedPolyline.map(([lat, lng]: [number, number]) => ({
        lat,
        lng,
      }));

      // Dividir la ruta en puntos clave (cada 10% de la ruta)
      const numPoints = 10;
      const points: any[] = [];
      
      for (let i = 0; i < numPoints; i++) {
        const index = Math.floor((i / (numPoints - 1)) * (coordinates.length - 1));
        const coord = coordinates[index];
        
        // Calcular tiempo de llegada aproximado
        const progress = i / (numPoints - 1);
        const arrivalTime = new Date();
        arrivalTime.setMinutes(arrivalTime.getMinutes() + (leg.duration.value * progress / 60));
        
        points.push({
          coordinates: coord,
          arrivalTime,
          distance: leg.distance.value * progress,
          duration: leg.duration.value * progress,
        });
      }

      return {
        points,
        totalDistance: leg.distance.value,
        totalDuration: leg.duration.value,
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error('Error obteniendo la ruta:', error);
      throw new Error('No se pudo obtener la ruta');
    }
  }
}

export class WeatherService {
  /**
   * Obtiene el pronóstico del clima para una coordenada específica
   */
  static async getWeatherForecast(coordinates: Coordinates, timestamp: Date): Promise<WeatherData> {
    try {
      const response = await openWeatherClient.get<OpenWeatherResponse>('/forecast', {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          appid: config.OPENWEATHER_API_KEY,
          units: config.WEATHER_UNITS,
        },
      });

      // Encontrar el pronóstico más cercano al timestamp
      const targetTime = timestamp.getTime() / 1000;
      const forecast = response.data.list.reduce((prev: any, curr: any) => {
        return Math.abs(curr.dt - targetTime) < Math.abs(prev.dt - targetTime) ? curr : prev;
      });

      return {
        coordinates,
        temperature: forecast.main.temp,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        description: forecast.weather[0].description,
        icon: forecast.weather[0].icon,
        arrivalTime: timestamp,
      };
    } catch (error) {
      console.error('Error obteniendo el clima:', error);
      throw new Error('No se pudo obtener el pronóstico del clima');
    }
  }

  /**
   * Obtiene el clima para múltiples puntos de una ruta
   */
  static async getWeatherForRoute(routeData: RouteData): Promise<WeatherData[]> {
    const weatherPromises = routeData.points.map(point =>
      this.getWeatherForecast(point.coordinates, point.arrivalTime)
    );

    try {
      const weatherData = await Promise.all(weatherPromises);
      return weatherData;
    } catch (error) {
      console.error('Error obteniendo clima para la ruta:', error);
      throw new Error('No se pudo obtener el clima para la ruta');
    }
  }
}

// Función helper para obtener iconos de clima
export const getWeatherIcon = (iconCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', // Clear sky day
    '01n': '🌙', // Clear sky night
    '02d': '⛅', // Few clouds day
    '02n': '☁️', // Few clouds night
    '03d': '☁️', // Scattered clouds
    '03n': '☁️',
    '04d': '☁️', // Broken clouds
    '04n': '☁️',
    '09d': '🌧️', // Shower rain
    '09n': '🌧️',
    '10d': '🌦️', // Rain day
    '10n': '🌧️', // Rain night
    '11d': '⛈️', // Thunderstorm
    '11n': '⛈️',
    '13d': '🌨️', // Snow
    '13n': '🌨️',
    '50d': '🌫️', // Mist
    '50n': '🌫️',
  };

  return iconMap[iconCode] || '🌤️';
};
