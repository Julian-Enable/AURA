import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { Place } from '../types';

interface RouteFormProps {
  onSearch: (origin: string, destination: string, originPlace?: Place, destinationPlace?: Place) => void;
  onOriginSelect?: (place: Place) => void;
  loading: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ onSearch, onOriginSelect, loading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedOriginPlace, setSelectedOriginPlace] = useState<Place | null>(null);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<Place | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      onSearch(
        origin.trim(), 
        destination.trim(), 
        selectedOriginPlace || undefined, 
        selectedDestinationPlace || undefined
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
