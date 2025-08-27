import axios from 'axios';
import { RouteData, WeatherData, Coordinates } from '../types';
import { config } from '../config/env';
import { getPlaceDetails, getRoute as getOSRMRoute, getLocationName } from './places';

// Cliente axios para OpenWeather
const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
});

// Función auxiliar para calcular la distancia entre dos puntos
function getDistanceBetweenPoints(point1: Coordinates, point2: Coordinates): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export class RouteService {
  /**
   * Obtiene la ruta entre dos puntos usando OSRM
   */
  static originPoint: any = null;

  static async getRoute(originName: string, destinationName: string): Promise<RouteData> {
    try {
      // Obtener detalles de los lugares usando Nominatim
      const originResults = await getPlaceDetails(originName);
      const destinationResults = await getPlaceDetails(destinationName);
      
      // Guardar el punto de origen
      this.originPoint = originResults;

      if (!originResults || !destinationResults) {
        throw new Error('No se pudieron encontrar las ubicaciones especificadas');
      }

      const route = await getOSRMRoute(originResults, destinationResults);
      const totalDistance = route.distance;
      const totalDuration = route.duration;
      const now = new Date();
      
      // Seleccionar puntos estratégicos para el pronóstico del clima
      const numWeatherPoints = 10;
      const points = [];
      const routePoints = route.points;
      
      for (let i = 0; i < numWeatherPoints; i++) {
        const progress = i / (numWeatherPoints - 1);
        const targetDistance = totalDistance * progress;
        
        // Encontrar el punto más cercano en la ruta real
        let accumulatedDistance = 0;
        let selectedPointIndex = 0;
        
        for (let j = 1; j < routePoints.length; j++) {
          const segmentDistance = getDistanceBetweenPoints(
            routePoints[j - 1].coordinates,
            routePoints[j].coordinates
          );
          
          if (accumulatedDistance + segmentDistance > targetDistance) {
            selectedPointIndex = j;
            break;
          }
          accumulatedDistance += segmentDistance;
        }
        
        // Calcular tiempo de llegada basado en la proporción de la distancia
        const timeInSeconds = totalDuration * progress;
        const arrivalTime = new Date(now.getTime() + timeInSeconds * 1000);
        
        const coordinates = routePoints[selectedPointIndex].coordinates;
        const locationName = await getLocationName(coordinates);
        
        points.push({
          coordinates,
          arrivalTime,
          distance: targetDistance,
          duration: timeInSeconds,
          locationName: locationName || 'Punto en ruta'
        });
      }

      return {
        points,
        totalDistance,
        totalDuration,
        polyline: '', // Ya no necesitamos la polyline porque usamos los puntos directamente
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
  static async getWeatherForecast(coordinates: Coordinates, timestamp: Date, locationName?: string): Promise<WeatherData> {
    try {
      const response = await openWeatherClient.get('/forecast', {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng,
          appid: config.OPENWEATHER_API_KEY,
          units: 'metric',
          lang: 'es'
        },
      });

      if (!response.data?.list?.length) {
        throw new Error('Datos de pronóstico inválidos');
      }

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
        locationName
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
      this.getWeatherForecast(point.coordinates, point.arrivalTime, point.locationName)
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
