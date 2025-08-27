import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WeatherData } from '../types';
import { getWeatherIcon } from '../services/api';

interface WeatherMapProps {
  routeData: {
    points: Array<{
      coordinates: {
        lat: number;
        lng: number;
      };
    }>;
  };
  weatherPoints: Array<{
    coordinates: {
      lat: number;
      lng: number;
    };
    weather: WeatherData;
  }>;
  origin?: {
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

const WeatherMap: React.FC<WeatherMapProps> = ({ routeData, weatherPoints, origin }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Inicializar el mapa con el estilo de CartoDB
      const initialLat = origin?.coordinates.lat || 4.60971; // Default: Bogotá
      const initialLng = origin?.coordinates.lng || -74.08175;
      mapRef.current = L.map('map').setView([initialLat, initialLng], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapRef.current);
    }

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Limpiar ruta existente
    if (routeRef.current) {
      routeRef.current.remove();
    }

    if (weatherPoints?.length > 0 && routeData?.points?.length > 0) {
      // Crear nuevos marcadores para cada punto del clima
      weatherPoints.forEach(point => {
        const customIcon = L.divIcon({
          className: 'custom-div-icon-fixed',
          html: `
            <div class="weather-marker">
              <div class="weather-marker-content">
                <div class="weather-icon">${getWeatherIcon(point.weather.icon)}</div>
                <div class="weather-info">
                  <div class="temperature">${Math.round(point.weather.temperature)}°C</div>
                  <div class="arrival-time">${point.weather.arrivalTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          `,
          iconSize: [90, 80],
          iconAnchor: [45, 80],
        });

        const marker = L.marker([point.coordinates.lat, point.coordinates.lng], {
          icon: customIcon,
        }).addTo(mapRef.current!);

        markersRef.current.push(marker);
      });

      // Dibujar la ruta
      const routePoints = routeData.points.map(point => [point.coordinates.lat, point.coordinates.lng]);
      routeRef.current = L.polyline(routePoints as L.LatLngExpression[], {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.8,
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Ajustar la vista del mapa
      const bounds = L.latLngBounds(routePoints as L.LatLngExpression[]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        if (routeRef.current) {
          routeRef.current.remove();
        }
      }
    };
  }, [weatherPoints, routeData]);

  return (
    <div id="map" className="h-full w-full rounded-lg shadow-lg" />
  );
};

export default WeatherMap;
