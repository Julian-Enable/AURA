import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteData, WeatherPoint } from '../types';
import { getWeatherIcon } from '../services/api';

interface WeatherMapProps {
  routeData: RouteData | null;
  weatherPoints: WeatherPoint[];
}

// Configurar iconos personalizados para Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WeatherMap: React.FC<WeatherMapProps> = ({ routeData, weatherPoints }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const weatherMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar el mapa
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([19.4326, -99.1332], 10); // México City por defecto

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Limpiar marcadores anteriores
    weatherMarkersRef.current.forEach(marker => marker.remove());
    weatherMarkersRef.current = [];

    // Limpiar ruta anterior
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
    }

         if (routeData) {
       // Para datos simulados, crear una ruta más realista
       let routeCoordinates: [number, number][];
       
               if (routeData.polyline === 'mock_polyline_data') {
          // Crear una ruta simulada más realista basada en los puntos de la ruta
          routeCoordinates = routeData.points.map(point => [
            point.coordinates.lat,
            point.coordinates.lng
          ]) as [number, number][];
       } else {
         // Para datos reales, usar la polyline decodificada
         routeCoordinates = routeData.points.map(point => [
           point.coordinates.lat,
           point.coordinates.lng
         ]) as [number, number][];
       }

       routeLayerRef.current = L.polyline(routeCoordinates, {
         color: '#1e40af',
         weight: 4,
         opacity: 0.8
       }).addTo(map);

      // Ajustar vista para mostrar toda la ruta
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [20, 20] });

      // Agregar marcadores de inicio y fin
      const startMarker = L.marker(routeCoordinates[0], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);

      const endMarker = L.marker(routeCoordinates[routeCoordinates.length - 1], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);

      startMarker.bindPopup('<b>Punto de inicio</b>');
      endMarker.bindPopup('<b>Destino</b>');
    }

    // Agregar marcadores de clima
    weatherPoints.forEach((point, index) => {
      const weatherIcon = getWeatherIcon(point.weather.icon);
      const arrivalTime = point.arrivalTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const marker = L.marker([point.coordinates.lat, point.coordinates.lng], {
        icon: L.divIcon({
          className: 'weather-marker',
          html: `
            <div style="
              background: white;
              border: 2px solid #1e40af;
              border-radius: 8px;
              padding: 8px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              text-align: center;
              min-width: 60px;
            ">
              <div style="font-size: 20px; margin-bottom: 4px;">${weatherIcon}</div>
              <div style="font-size: 12px; font-weight: bold; color: #1e40af;">${Math.round(point.weather.temperature)}°C</div>
              <div style="font-size: 10px; color: #666;">${arrivalTime}</div>
            </div>
          `,
          iconSize: [60, 80],
          iconAnchor: [30, 40]
        })
      }).addTo(map);

      const popupContent = `
        <div style="min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; color: #1e40af;">Punto ${index + 1}</h3>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 24px; margin-right: 8px;">${weatherIcon}</span>
            <div>
              <div style="font-weight: bold; font-size: 16px;">${Math.round(point.weather.temperature)}°C</div>
              <div style="font-size: 12px; color: #666;">${point.weather.description}</div>
            </div>
          </div>
          <div style="font-size: 12px; color: #666;">
            <div>💨 Viento: ${point.weather.windSpeed} m/s</div>
            <div>💧 Humedad: ${point.weather.humidity}%</div>
            <div>🕐 Llegada: ${arrivalTime}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      weatherMarkersRef.current.push(marker);
    });

  }, [routeData, weatherPoints]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
};

export default WeatherMap;
