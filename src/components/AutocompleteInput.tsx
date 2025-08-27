import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { searchPlaces } from '../services/places';
import { Place } from '../types';

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: Place) => void;
  className?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastSearchValue, setLastSearchValue] = useState('');
  const [justSelected, setJustSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce para evitar demasiadas llamadas a la API
  useEffect(() => {
    // Si acabamos de seleccionar algo, no buscar
    if (justSelected) {
      return;
    }

    // Si el valor no ha cambiado, no buscar
    if (value === lastSearchValue) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (value.length >= 3 && value !== lastSearchValue && !justSelected) {
        setLoading(true);
        try {
          const places = await searchPlaces(value);
          setSuggestions(places);
          setShowSuggestions(places.length > 0);
          setSelectedIndex(-1);
          setLastSearchValue(value);
        } catch (error) {
          console.error('Error en autocompletado:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoading(false);
        }
      } else if (value.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setLastSearchValue('');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, lastSearchValue, justSelected]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Resetear la bandera de justSelected cuando el usuario empieza a escribir
    if (justSelected && newValue !== value) {
      setJustSelected(false);
    }
    
    // Solo mostrar sugerencias si el usuario está escribiendo
    if (!justSelected) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: Place) => {
    // Marcar que acabamos de seleccionar
    setJustSelected(true);
    
    // Limpiar inmediatamente las sugerencias
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Actualizar el valor
    onChange(suggestion.name);
    setLastSearchValue(suggestion.name);
    
    // Callback de selección
    if (onSelect) {
      onSelect(suggestion);
    }
    
    // Quitar el foco del input para evitar que se dispare onFocus
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Solo mostrar sugerencias si hay sugerencias disponibles y no acabamos de seleccionar
            if (suggestions.length > 0 && !justSelected) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aura-blue focus:border-aura-blue transition-colors"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aura-blue"></div>
          </div>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && !justSelected && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.coordinates.lat}-${suggestion.coordinates.lng}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-aura-blue bg-opacity-10' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="text-lg mr-3 mt-0.5 flex-shrink-0">
                  {suggestion.placeType ? suggestion.placeType.split(' ')[0] : '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {suggestion.name}
                  </div>
                  {suggestion.placeType && (
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      {suggestion.placeType}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.displayName || suggestion.fullAddress}
                  </div>
                  {(suggestion.city || suggestion.state) && (
                    <div className="text-xs text-gray-400 mt-1">
                      {[suggestion.city, suggestion.state, suggestion.country]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
