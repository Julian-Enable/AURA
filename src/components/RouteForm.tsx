import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, Clock } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import { Place, TimezoneInfo } from '../types';
import { getTimezoneInfo, getCurrentTimeInTimezone, formatForDateTimeLocal } from '../services/timezone';

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
  const [originTimezone, setOriginTimezone] = useState<TimezoneInfo | null>(null);
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  
  // Tiempo por defecto: ahora + 30 minutos (solo al inicializar)
  const [departureTime, setDepartureTime] = useState(() => {
    const now = new Date();
    // Usar hora local del navegador como default inicial
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const defaultTime = new Date(localTime.getTime() + 30 * 60 * 1000);
    return defaultTime.toISOString().slice(0, 16);
  });
  
  // Calcular el tiempo mínimo basado en la zona horaria del origen
  // Permitimos seleccionar la hora actual para salidas inmediatas
  const getMinDateTime = (): string => {
    try {
      // Establecer una fecha mínima en el pasado cercano para permitir seleccionar la hora actual
      // Restamos 5 minutos para dar margen en diferencias entre relojes
      if (originTimezone) {
        // Usar zona horaria del origen
        const currentTimeInOrigin = getCurrentTimeInTimezone(originTimezone);
        const adjustedTime = new Date(currentTimeInOrigin.getTime() - 5 * 60 * 1000);
        return formatForDateTimeLocal(adjustedTime, originTimezone);
      } else {
        // Fallback a hora local del navegador
        const now = new Date();
        const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const adjustedTime = new Date(localNow.getTime() - 5 * 60 * 1000);
        return adjustedTime.toISOString().slice(0, 16);
      }
    } catch (error) {
      console.error('Error calculando hora mínima:', error);
      const fallbackDate = new Date();
      return fallbackDate.toISOString().slice(0, 16);
    }
  };
  
  const minDateTime = getMinDateTime();

  // Obtener zona horaria cuando se selecciona el origen
  useEffect(() => {
    const fetchOriginTimezone = async () => {
      if (selectedOriginPlace?.coordinates) {
        setTimezoneLoading(true);
        try {
          const timezoneInfo = await getTimezoneInfo(selectedOriginPlace.coordinates);
          
          // Verificar que timezoneInfo sea válido
          if (timezoneInfo && timezoneInfo.localTime && !isNaN(timezoneInfo.localTime.getTime())) {
            setOriginTimezone(timezoneInfo);
            
            // Actualizamos la lógica para permitir selección de hora actual
            const currentTimeInOrigin = getCurrentTimeInTimezone(timezoneInfo);
            
            // Hora actual sin ajustes para permitir salidas inmediatas
            const currentFormattedTime = formatForDateTimeLocal(currentTimeInOrigin, timezoneInfo);
            
            // Solo ajustamos si la hora seleccionada está muy en el pasado (más de 10 minutos)
            const bufferTime = new Date(currentTimeInOrigin.getTime() - 10 * 60 * 1000);
            const minTimeWithBuffer = formatForDateTimeLocal(bufferTime, timezoneInfo);
            
            if (departureTime < minTimeWithBuffer) {
              // Usar la hora actual en lugar de añadir 30 minutos para permitir salidas inmediatas
              setDepartureTime(currentFormattedTime);
            }
          } else {
            console.warn('Timezone info inválido, usando fallback');
            setOriginTimezone(null);
          }
        } catch (error) {
          console.error('Error obteniendo zona horaria:', error);
          setOriginTimezone(null);
        } finally {
          setTimezoneLoading(false);
        }
      } else {
        setOriginTimezone(null);
      }
    };

    fetchOriginTimezone();
  }, [selectedOriginPlace, departureTime]);
  
  // Modificamos la lógica para ser menos restrictiva con las fechas en el pasado cercano
  useEffect(() => {
    try {
      // Solo ajustamos si la hora seleccionada está muy en el pasado (más de 10 minutos)
      // Esto permite seleccionar la hora actual o una ligeramente en el pasado para salidas inmediatas
      const minTimeWithBuffer = new Date(new Date(minDateTime).getTime() - 10 * 60 * 1000).toISOString().slice(0, 16);
      
      if (departureTime < minTimeWithBuffer) {
        if (originTimezone) {
          const currentTimeInOrigin = getCurrentTimeInTimezone(originTimezone);
          // Usamos la hora actual en lugar de agregar 30 minutos para permitir salidas inmediatas
          setDepartureTime(formatForDateTimeLocal(currentTimeInOrigin, originTimezone));
        } else {
          const now = new Date();
          const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
          setDepartureTime(localNow.toISOString().slice(0, 16));
        }
      }
    } catch (error) {
      console.error('Error verificando tiempo mínimo:', error);
    }
  }, [minDateTime, departureTime, originTimezone]);

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
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
            <span>Hora de Partida</span>
            {originTimezone && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {originTimezone.abbreviation}
              </span>
            )}
            {timezoneLoading && (
              <span className="text-xs text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
                Detectando zona horaria...
              </span>
            )}
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
            {originTimezone ? (
              <>
                Clima calculado en zona horaria de <strong>{selectedOriginPlace?.city || 'origen'}</strong> ({originTimezone.abbreviation})
              </>
            ) : (
              'El clima se calculará para esta hora de partida'
            )}
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
