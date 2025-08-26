import React from 'react';
import { RouteData, WeatherPoint } from '../types';
import { getWeatherIcon } from '../services/api';
import { Clock, MapPin, Thermometer, Wind, Droplets } from 'lucide-react';

interface RouteDetailsProps {
  routeData: RouteData;
  weatherPoints: WeatherPoint[];
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ routeData, weatherPoints }) => {
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
    <div className="weather-card">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-aura-blue mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Detalles de la Ruta</h2>
      </div>

      {/* Resumen de la ruta */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-aura-blue mr-2" />
            <span className="text-sm font-medium text-gray-700">Duración Total</span>
          </div>
          <p className="text-lg font-bold text-aura-blue mt-1">
            {formatDuration(routeData.totalDuration)}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Distancia Total</span>
          </div>
          <p className="text-lg font-bold text-green-600 mt-1">
            {formatDistance(routeData.totalDistance)}
          </p>
        </div>
      </div>

      {/* Puntos de clima */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pronóstico del Clima en Ruta</h3>
        
        {weatherPoints.map((point, index) => {
          const weatherIcon = getWeatherIcon(point.weather.icon);
          const arrivalTime = point.arrivalTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{weatherIcon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Punto {index + 1}</h4>
                    <p className="text-sm text-gray-600">{point.weather.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Llegada</p>
                  <p className="font-semibold text-aura-blue">{arrivalTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 text-red-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Temperatura</p>
                    <p className="font-semibold text-gray-800">{Math.round(point.weather.temperature)}°C</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Wind className="w-4 h-4 text-blue-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Viento</p>
                    <p className="font-semibold text-gray-800">{point.weather.windSpeed} m/s</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 text-cyan-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Humedad</p>
                    <p className="font-semibold text-gray-800">{point.weather.humidity}%</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consejos basados en el clima */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">🌤️ Consejos para tu Viaje</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {weatherPoints.some(p => p.weather.description.includes('lluvia') || p.weather.description.includes('rain')) && (
            <li>• Lleva paraguas o impermeable - hay lluvia en el camino</li>
          )}
          {weatherPoints.some(p => p.weather.temperature < 10) && (
            <li>• Abrígate bien - habrá temperaturas bajas</li>
          )}
          {weatherPoints.some(p => p.weather.windSpeed > 10) && (
            <li>• Ten cuidado con el viento fuerte en algunos tramos</li>
          )}
          {weatherPoints.every(p => p.weather.description.includes('clear') || p.weather.description.includes('sunny')) && (
            <li>• ¡Excelente clima para el viaje! No olvides protector solar</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default RouteDetails;
