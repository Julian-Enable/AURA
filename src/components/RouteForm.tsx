import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { PlacePrediction } from '../services/places';

interface RouteFormProps {
  onSearch: (origin: string, destination: string) => void;
  loading: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      onSearch(origin.trim(), destination.trim());
    }
  };

  const handleOriginSelect = (place: PlacePrediction) => {
    setOrigin(place.description);
  };

  const handleDestinationSelect = (place: PlacePrediction) => {
    setDestination(place.description);
  };

  return (
    <div className="weather-card">
      <div className="flex items-center mb-4">
        <MapPin className="w-5 h-5 text-aura-blue mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Planificar Ruta con Clima</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <AutocompleteInput
          label="Punto de Origen"
          placeholder="Ej: Ciudad de México, México"
          value={origin}
          onChange={setOrigin}
          onSelect={handleOriginSelect}
          searchType="all"
        />

        <AutocompleteInput
          label="Destino"
          placeholder="Ej: Guadalajara, México"
          value={destination}
          onChange={setDestination}
          onSelect={handleDestinationSelect}
          searchType="all"
        />

        <button
          type="submit"
          disabled={loading || !origin.trim() || !destination.trim()}
          className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando ruta...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Buscar Ruta y Clima
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Consejo:</strong> Escribe el nombre de la ciudad y selecciona de las sugerencias 
          para obtener el pronóstico del clima a lo largo de tu ruta.
        </p>
      </div>
    </div>
  );
};

export default RouteForm;
