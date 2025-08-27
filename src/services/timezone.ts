import { Coordinates, TimezoneInfo } from '../types';

/**
 * Mapeo de coordenadas aproximadas a zonas horarias conocidas de Sudamérica
 * Esto sirve como fallback rápido sin API calls
 */
const SOUTH_AMERICA_TIMEZONES = [
  // Colombia, Venezuela, Perú, Ecuador, Panamá
  { 
    bounds: { latMin: -4, latMax: 12, lngMin: -82, lngMax: -66 },
    timezone: 'America/Bogota',
    offset: -5 * 3600
  },
  // Brasil (la mayoría del territorio)
  {
    bounds: { latMin: -34, latMax: 5, lngMin: -74, lngMax: -34 },
    timezone: 'America/Sao_Paulo',
    offset: -3 * 3600
  },
  // Argentina, Chile, Uruguay
  {
    bounds: { latMin: -55, latMax: -21, lngMin: -73, lngMax: -53 },
    timezone: 'America/Argentina/Buenos_Aires',
    offset: -3 * 3600
  },
  // Bolivia, Paraguay
  {
    bounds: { latMin: -27, latMax: -9, lngMin: -69, lngMax: -57 },
    timezone: 'America/La_Paz',
    offset: -4 * 3600
  },
  // Guyana, Suriname, Guayana Francesa
  {
    bounds: { latMin: 1, latMax: 8, lngMin: -62, lngMax: -51 },
    timezone: 'America/Guyana',
    offset: -4 * 3600
  }
];

/**
 * Obtiene información de zona horaria usando WorldTimeAPI
 */
export async function getTimezoneInfo(coordinates: Coordinates): Promise<TimezoneInfo> {
  // Primero usar mapeo local como base
  const localGuess = getTimezoneFromLocalMapping(coordinates);
  
  try {
    // Intentar con WorldTimeAPI solo si no estamos en desarrollo
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      const worldTimeInfo = await getTimezoneFromWorldTimeAPI(coordinates);
      if (worldTimeInfo) {
        return worldTimeInfo;
      }
    }
  } catch (error) {
    console.warn('WorldTimeAPI no disponible, usando mapeo local:', error);
  }

  // Siempre retornar el mapeo local como fallback confiable
  return localGuess;
}

/**
 * Obtiene zona horaria usando WorldTimeAPI
 */
async function getTimezoneFromWorldTimeAPI(coordinates: Coordinates): Promise<TimezoneInfo | null> {
  try {
    // WorldTimeAPI no acepta coordenadas directamente, pero podemos usar un enfoque inteligente
    // Primero determinar la zona horaria probable usando nuestro mapeo local
    const localGuess = getTimezoneFromLocalMapping(coordinates);
    
    // Luego verificar/corregir con WorldTimeAPI usando HTTPS
    const response = await fetch(`https://worldtimeapi.org/api/timezone/${localGuess.timezone}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('WorldTimeAPI no disponible');
    }

    const data = await response.json();
    
    return {
      timezone: data.timezone,
      abbreviation: data.abbreviation,
      utcOffset: data.utc_offset,
      datetime: data.datetime,
      localTime: new Date(data.datetime)
    };
  } catch (error) {
    console.error('Error obteniendo timezone de WorldTimeAPI:', error);
    return null;
  }
}

/**
 * Obtiene zona horaria usando mapeo local (fallback)
 */
function getTimezoneFromLocalMapping(coordinates: Coordinates): TimezoneInfo {
  const { lat, lng } = coordinates;
  
  // Buscar en qué zona cae la coordenada
  for (const zone of SOUTH_AMERICA_TIMEZONES) {
    if (
      lat >= zone.bounds.latMin &&
      lat <= zone.bounds.latMax &&
      lng >= zone.bounds.lngMin &&
      lng <= zone.bounds.lngMax
    ) {
      // Calcular hora local basada en el offset - usando método más seguro
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const localTime = new Date(utcTime + (zone.offset * 1000));
      
      // Validar que la fecha sea válida
      if (isNaN(localTime.getTime())) {
        console.warn('Fecha inválida calculada, usando hora actual');
        return {
          timezone: zone.timezone,
          abbreviation: getTimezoneAbbreviation(zone.timezone),
          utcOffset: zone.offset,
          datetime: now.toISOString(),
          localTime: now
        };
      }
      
      return {
        timezone: zone.timezone,
        abbreviation: getTimezoneAbbreviation(zone.timezone),
        utcOffset: zone.offset,
        datetime: localTime.toISOString(),
        localTime: localTime
      };
    }
  }
  
  // Default: usar timezone del navegador si no encuentra match
  const now = new Date();
  
  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    abbreviation: 'LOCAL',
    utcOffset: -now.getTimezoneOffset() * 60,
    datetime: now.toISOString(),
    localTime: now
  };
}

/**
 * Obtiene abreviación de zona horaria
 */
function getTimezoneAbbreviation(timezone: string): string {
  const abbreviations: { [key: string]: string } = {
    'America/Bogota': 'COT',
    'America/Sao_Paulo': 'BRT',
    'America/Argentina/Buenos_Aires': 'ART',
    'America/La_Paz': 'BOT',
    'America/Guyana': 'GYT',
    'America/Caracas': 'VET',
    'America/Lima': 'PET',
    'America/Santiago': 'CLT'
  };
  
  return abbreviations[timezone] || timezone.split('/').pop()?.toUpperCase() || 'UTC';
}

/**
 * Convierte una fecha a la zona horaria específica
 */
export function convertToTimezone(date: Date, timezoneInfo: TimezoneInfo): Date {
  // Obtener timestamp UTC
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Aplicar offset de la zona horaria de destino
  const targetTime = new Date(utcTime + (timezoneInfo.utcOffset * 1000));
  
  return targetTime;
}

/**
 * Obtiene la hora actual en una zona horaria específica
 */
export function getCurrentTimeInTimezone(timezoneInfo: TimezoneInfo): Date {
  return convertToTimezone(new Date(), timezoneInfo);
}

/**
 * Formatea una fecha para input datetime-local en zona específica
 */
export function formatForDateTimeLocal(date: Date, timezoneInfo: TimezoneInfo): string {
  const localDate = convertToTimezone(date, timezoneInfo);
  return localDate.toISOString().slice(0, 16);
}
