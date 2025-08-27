import React, { useEffect, useState } from 'react';
import { RouteData, WeatherPoint } from '../types';
import { getWeatherIcon } from '../services/api';
import { getLocationName } from '../services/places';
import { Clock, MapPin, Thermometer, Wind, Droplets, CloudRain } from 'lucide-react';

interface RouteDetailsProps {
  routeData: RouteData;
  weatherPoints: WeatherPoint[];
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ routeData, weatherPoints }) => {
  const [cityNames, setCityNames] = useState<string[]>([]);

  useEffect(() => {
    const loadCityNames = async () => {
      const names = [];
      // Cargar los nombres de las ciudades secuencialmente con un retraso
      for (const point of weatherPoints) {
        try {
          const name = await getLocationName(point.coordinates);
          names.push(name);
          setCityNames([...names]); // Actualizar el estado gradualmente
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre peticiones
        } catch (error) {
          console.warn('Error al cargar nombre de ciudad:', error);
          names.push('Punto en ruta');
        }
      }
    };
    
    if (weatherPoints.length > 0) {
      loadCityNames();
    }
  }, [weatherPoints]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  return (
    <div className="weather-card bg-gradient-to-br from-white to-blue-50">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-2 rounded-lg mr-3">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Detalles de la Ruta</h2>
          <p className="text-sm text-gray-600 mt-1">Información detallada de tu viaje</p>
        </div>
      </div>

      {/* Resumen de la ruta */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Tiempo de Viaje</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatDuration(routeData.totalDuration)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Distancia</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatDistance(routeData.totalDistance)}
          </p>
        </div>
      </div>

      {/* Puntos de clima */}
      <div className="space-y-3">
        <div className="flex items-center mb-3">
          <div className="bg-blue-500 p-2 rounded-lg mr-3">
            <CloudRain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Pronóstico del Clima en Ruta</h3>
        </div>
        
        {weatherPoints.map((point, index) => {
          const weatherIcon = getWeatherIcon(point.weather.icon);
          const arrivalTime = point.arrivalTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={index} className="bg-white rounded-lg border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl">{weatherIcon}</div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-700">{cityNames[index] || `Punto ${index + 1}`}</h4>
                    <p className="text-sm text-gray-500 capitalize">{point.weather.description}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Llegada</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {arrivalTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 text-red-500 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Temperatura</div>
                    <div className="text-sm font-semibold text-gray-700">{Math.round(point.weather.temperature)}°C</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Wind className="w-4 h-4 text-blue-500 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Viento</div>
                    <div className="text-sm font-semibold text-gray-700">{point.weather.windSpeed} m/s</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 text-cyan-500 mr-2" />
                  <div>
                    <div className="text-xs text-gray-500">Humedad</div>
                    <div className="text-sm font-semibold text-gray-700">{point.weather.humidity}%</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consejos basados en el clima */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-yellow-100 shadow-sm overflow-hidden">
          <div className="border-b border-yellow-100 bg-yellow-50/50 px-6 py-4">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                <span className="text-2xl">🌤️</span>
              </div>
              <h4 className="text-lg font-bold text-yellow-800">Recomendaciones para tu Viaje</h4>
            </div>
          </div>
          
          <div className="p-6">
            <ul className="space-y-3">
              {weatherPoints.some(p => p.weather.description.includes('lluvia') || p.weather.description.includes('rain')) && (
                <li className="flex items-center text-yellow-800">
                  <span className="text-xl mr-3">☔</span>
                  <span>Lleva paraguas o impermeable - hay probabilidad de lluvia en tu ruta</span>
                </li>
              )}
              {weatherPoints.some(p => p.weather.temperature < 10) && (
                <li className="flex items-center text-yellow-800">
                  <span className="text-xl mr-3">🧥</span>
                  <span>Te recomendamos abrigarte bien - se esperan temperaturas bajas</span>
                </li>
              )}
              {weatherPoints.some(p => p.weather.windSpeed > 10) && (
                <li className="flex items-center text-yellow-800">
                  <span className="text-xl mr-3">💨</span>
                  <span>Precaución con el viento fuerte en algunos tramos del recorrido</span>
                </li>
              )}
              {weatherPoints.every(p => p.weather.description.includes('clear') || p.weather.description.includes('sunny')) && (
                <li className="flex items-center text-yellow-800">
                  <span className="text-xl mr-3">🌞</span>
                  <span>¡Clima perfecto para viajar! Recuerda usar protector solar</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
