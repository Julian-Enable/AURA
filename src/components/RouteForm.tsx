import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { Place } from '../types';

interface RouteFormProps {
  onSearch: (origin: string, destination: string, originPlace?: Place, destinationPlace?: Place, departureTime?: Date) => void;
  onOriginSelect?: (place: Place) => void;
  loading: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ onSearch, onOriginSelect, loading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedOriginPlace, setSelectedOriginPlace] = useState<Place | null>(null);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<Place | null>(null);
  
  // Tiempo por defecto: ahora + 30 minutos (solo al inicializar)
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    const defaultTime = new Date(now.getTime() + 30 * 60 * 1000);
    return defaultTime.toISOString().slice(0, 16);
  });
  
  // Calcular el tiempo mínimo en tiempo real (se actualiza en cada render)
  const minDateTime = new Date().toISOString().slice(0, 16);
  
  // Si el tiempo seleccionado está en el pasado, actualizarlo
  useEffect(() => {
    if (departureTime < minDateTime) {
      const newTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);
      setDepartureTime(newTime);
    }
  }, [minDateTime, departureTime]);
  
  // Debug: Ver qué valores tenemos
  console.log('Valores de tiempo:', {
    ahora: new Date().toLocaleString(),
    minDateTime,
    departureTime,
    departureTimeAsDate: new Date(departureTime).toLocaleString(),
    esPasado: departureTime < minDateTime
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      const departure = new Date(departureTime);
      onSearch(
        origin.trim(), 
        destination.trim(), 
        selectedOriginPlace || undefined, 
        selectedDestinationPlace || undefined,
        departure
      );
    }
  };

  const handleOriginSelect = (place: Place) => {
    setOrigin(place.name);
    setSelectedOriginPlace(place);
    // Notificar al componente padre que se seleccionó un origen
    if (onOriginSelect) {
      onOriginSelect(place);
    }
  };

  const handleDestinationSelect = (place: Place) => {
    setDestination(place.name);
    setSelectedDestinationPlace(place);
  };

  return (
    <div className="weather-card bg-gradient-to-br from-white to-blue-50">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 p-2 rounded-lg mr-3">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Planificar Ruta</h2>
          <p className="text-sm text-gray-600 mt-1">Obtén el pronóstico del clima en tu camino</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <AutocompleteInput
            label="Punto de Origen"
            placeholder="¿Desde dónde partes?"
            value={origin}
            onChange={setOrigin}
            onSelect={handleOriginSelect}
            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-0 top-1/2 w-8 h-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="relative">
          <AutocompleteInput
            label="Destino"
            placeholder="¿Hacia dónde vas?"
            value={destination}
            onChange={setDestination}
            onSelect={handleDestinationSelect}
            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-0 top-1/2 w-8 h-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora de Partida
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              min={minDateTime}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aura-blue focus:border-aura-blue transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            El clima se calculará para esta hora de partida
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !origin.trim() || !destination.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              <span className="text-sm">Analizando tu ruta...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-3" />
              <span>Buscar Ruta y Clima</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <div className="text-blue-500 text-lg">💡</div>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Busca cualquier ubicación del mundo y selecciona una sugerencia para obtener el pronóstico detallado del clima durante tu viaje.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteForm;
