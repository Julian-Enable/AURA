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
    name?: string;
  };
  shouldCenterOnOrigin?: boolean;
}

const WeatherMap: React.FC<WeatherMapProps> = ({ routeData, weatherPoints, origin, shouldCenterOnOrigin }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);

  // Efecto para centrar el mapa en el origen cuando se selecciona
  useEffect(() => {
    if (origin && mapRef.current && shouldCenterOnOrigin) {
      // Centrar el mapa en el origen con un zoom apropiado
      mapRef.current.setView([origin.coordinates.lat, origin.coordinates.lng], 12, {
        animate: true,
        duration: 1.5 // Animación más suave
      });

      // Limpiar marcador de origen anterior
      if (originMarkerRef.current) {
        originMarkerRef.current.remove();
      }

      // Crear marcador para el origen
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div class="origin-marker-content">
            <div class="origin-pin">
              <div class="origin-pin-icon">📍</div>
            </div>
            <div class="origin-label">${origin.name || 'Origen'}</div>
          </div>
        `,
        iconSize: [40, 60],
        iconAnchor: [20, 50],
      });

      originMarkerRef.current = L.marker([origin.coordinates.lat, origin.coordinates.lng], {
        icon: originIcon,
      }).addTo(mapRef.current);
    }
  }, [origin, shouldCenterOnOrigin]);

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
      // Mantener el marcador de origen si existe
      if (origin && !originMarkerRef.current) {
        const originIcon = L.divIcon({
          className: 'origin-marker',
          html: `
            <div class="origin-marker-content">
              <div class="origin-pin">
                <div class="origin-pin-icon">📍</div>
              </div>
              <div class="origin-label">${origin.name || 'Origen'}</div>
            </div>
          `,
          iconSize: [40, 60],
          iconAnchor: [20, 50],
        });

        originMarkerRef.current = L.marker([origin.coordinates.lat, origin.coordinates.lng], {
          icon: originIcon,
        }).addTo(mapRef.current);
      }

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

      // ¡SOLUCIÓN SIMPLE! Solo mantenemos el mapa donde está (en el origen) 
      // y NO lo movemos automáticamente después del análisis
      // El usuario puede usar el botón "Origen" si necesita volver
      
      // Solo ajustar si NO tenemos origen definido (fallback)
      if (!origin && routePoints.length > 0) {
        const bounds = L.latLngBounds(routePoints as L.LatLngExpression[]);
        mapRef.current.fitBounds(bounds, { 
          padding: [40, 40], 
          maxZoom: 9 
        });
      }
    }

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        if (routeRef.current) {
          routeRef.current.remove();
        }
        if (originMarkerRef.current) {
          originMarkerRef.current.remove();
        }
      }
    };
  }, [weatherPoints, routeData]);

  return (
    <div id="map" className="h-full w-full rounded-lg shadow-lg" />
  );
};

export default WeatherMap;
