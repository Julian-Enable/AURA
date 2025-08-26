import { RouteData, WeatherPoint, Coordinates } from '../types';

// Datos de ejemplo para demostración
export const mockRouteData: RouteData = {
  points: [
    {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      arrivalTime: new Date(Date.now() + 0 * 60 * 60 * 1000), // Ahora
      distance: 0,
      duration: 0,
    },
    {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      arrivalTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // +1 hora
      distance: 50000,
      duration: 3600,
    },
    {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 horas
      distance: 100000,
      duration: 7200,
    },
    {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 horas
      distance: 150000,
      duration: 10800,
    },
    {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      arrivalTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4 horas
      distance: 200000,
      duration: 14400,
    },
  ],
  totalDistance: 200000,
  totalDuration: 14400,
  polyline: 'mock_polyline_data',
};

export const mockWeatherPoints: WeatherPoint[] = [
  {
    coordinates: { lat: 19.4326, lng: -99.1332 },
    weather: {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      temperature: 22,
      humidity: 65,
      windSpeed: 5,
      description: 'cielo despejado',
      icon: '01d',
      arrivalTime: new Date(Date.now() + 0 * 60 * 60 * 1000),
    },
    arrivalTime: new Date(Date.now() + 0 * 60 * 60 * 1000),
  },
  {
    coordinates: { lat: 19.4326, lng: -99.1332 },
    weather: {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      temperature: 24,
      humidity: 60,
      windSpeed: 8,
      description: 'pocas nubes',
      icon: '02d',
      arrivalTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
    arrivalTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
  },
  {
    coordinates: { lat: 19.4326, lng: -99.1332 },
    weather: {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      temperature: 26,
      humidity: 55,
      windSpeed: 12,
      description: 'lluvia ligera',
      icon: '10d',
      arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
  {
    coordinates: { lat: 19.4326, lng: -99.1332 },
    weather: {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      temperature: 25,
      humidity: 70,
      windSpeed: 6,
      description: 'nubes dispersas',
      icon: '03d',
      arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    },
    arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
  },
  {
    coordinates: { lat: 19.4326, lng: -99.1332 },
    weather: {
      coordinates: { lat: 19.4326, lng: -99.1332 },
      temperature: 23,
      humidity: 75,
      windSpeed: 4,
      description: 'cielo despejado',
      icon: '01d',
      arrivalTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
    arrivalTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
  },
];

// Función para generar datos de ejemplo más realistas
export const generateMockRouteData = (_origin: string, destination: string): RouteData => {
  // Determinar qué ruta usar basado en el destino
  let routeWaypoints: Coordinates[] = [];
  let totalDistance = 500000; // 500 km por defecto
  let totalDuration = 18000; // 5 horas por defecto
  
  const destLower = destination.toLowerCase();
  
  if (destLower.includes('guadalajara') || destLower.includes('jalisco')) {
    // Ruta México City - Guadalajara (carretera 15D)
    routeWaypoints = [
      { lat: 19.4326, lng: -99.1332 }, // México City
      { lat: 19.2833, lng: -99.1500 }, // Cuernavaca
      { lat: 18.8500, lng: -99.2000 }, // Temixco
      { lat: 18.6000, lng: -99.2500 }, // Puente de Ixtla
      { lat: 18.3500, lng: -99.3500 }, // Taxco
      { lat: 18.1000, lng: -99.5000 }, // Iguala
      { lat: 17.8500, lng: -99.7000 }, // Chilpancingo
      { lat: 17.6000, lng: -99.9000 }, // Acapulco (desvío)
      { lat: 17.8000, lng: -100.2000 }, // Zihuatanejo
      { lat: 18.0000, lng: -100.5000 }, // Lázaro Cárdenas
      { lat: 18.2000, lng: -100.8000 }, // Uruapan
      { lat: 18.4000, lng: -101.1000 }, // Morelia
      { lat: 18.6000, lng: -101.4000 }, // Pátzcuaro
      { lat: 18.8000, lng: -101.7000 }, // Zamora
      { lat: 19.0000, lng: -102.0000 }, // La Piedad
      { lat: 19.2000, lng: -102.3000 }, // Sahuayo
      { lat: 19.4000, lng: -102.6000 }, // Jiquilpan
      { lat: 19.6000, lng: -102.9000 }, // Tuxpan
      { lat: 19.8000, lng: -103.1000 }, // Zapotlán
      { lat: 20.6597, lng: -103.3496 }, // Guadalajara
    ];
    totalDistance = 500000; // 500 km
    totalDuration = 18000; // 5 horas
  } else if (destLower.includes('monterrey') || destLower.includes('nuevo león')) {
    // Ruta México City - Monterrey (carretera 85D)
    routeWaypoints = [
      { lat: 19.4326, lng: -99.1332 }, // México City
      { lat: 19.7000, lng: -98.8000 }, // Pachuca
      { lat: 20.0000, lng: -98.5000 }, // Tulancingo
      { lat: 20.3000, lng: -98.2000 }, // Actopan
      { lat: 20.6000, lng: -97.9000 }, // Ixmiquilpan
      { lat: 20.9000, lng: -97.6000 }, // Zimapán
      { lat: 21.2000, lng: -97.3000 }, // Jacala
      { lat: 21.5000, lng: -97.0000 }, // Tamazunchale
      { lat: 21.8000, lng: -96.7000 }, // Ciudad Valles
      { lat: 22.1000, lng: -96.4000 }, // Río Verde
      { lat: 22.4000, lng: -96.1000 }, // Ciudad Fernández
      { lat: 22.7000, lng: -95.8000 }, // Xilitla
      { lat: 23.0000, lng: -95.5000 }, // Ciudad Mante
      { lat: 23.3000, lng: -95.2000 }, // González
      { lat: 23.6000, lng: -94.9000 }, // Aldama
      { lat: 23.9000, lng: -94.6000 }, // Altamira
      { lat: 24.2000, lng: -94.3000 }, // Tampico
      { lat: 24.5000, lng: -94.0000 }, // Ciudad Madero
      { lat: 24.8000, lng: -93.7000 }, // Victoria
      { lat: 25.6869, lng: -100.3111 }, // Monterrey
    ];
    totalDistance = 800000; // 800 km
    totalDuration = 28800; // 8 horas
  } else if (destLower.includes('puebla') || destLower.includes('puebla')) {
    // Ruta México City - Puebla (carretera 150D)
    routeWaypoints = [
      { lat: 19.4326, lng: -99.1332 }, // México City
      { lat: 19.3000, lng: -98.9000 }, // Chalco
      { lat: 19.2000, lng: -98.7000 }, // Amecameca
      { lat: 19.1000, lng: -98.5000 }, // San Martín Texmelucan
      { lat: 19.0500, lng: -98.2000 }, // Puebla
    ];
    totalDistance = 150000; // 150 km
    totalDuration = 7200; // 2 horas
  } else {
    // Ruta genérica (línea recta mejorada)
    routeWaypoints = [
      { lat: 19.4326, lng: -99.1332 }, // México City
      { lat: 19.2000, lng: -99.0000 }, // Punto intermedio 1
      { lat: 19.0000, lng: -98.8000 }, // Punto intermedio 2
      { lat: 18.8000, lng: -98.6000 }, // Punto intermedio 3
      { lat: 18.6000, lng: -98.4000 }, // Punto intermedio 4
      { lat: 18.4000, lng: -98.2000 }, // Punto intermedio 5
      { lat: 18.2000, lng: -98.0000 }, // Punto intermedio 6
      { lat: 18.0000, lng: -97.8000 }, // Punto intermedio 7
      { lat: 17.8000, lng: -97.6000 }, // Punto intermedio 8
      { lat: 17.6000, lng: -97.4000 }, // Punto intermedio 9
      { lat: 17.4000, lng: -97.2000 }, // Destino genérico
    ];
    totalDistance = 300000; // 300 km
    totalDuration = 10800; // 3 horas
  }
  
  const points = [];
  const numPoints = 10;
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const waypointIndex = Math.floor(progress * (routeWaypoints.length - 1));
    const nextWaypointIndex = Math.min(waypointIndex + 1, routeWaypoints.length - 1);
    
    const currentWaypoint = routeWaypoints[waypointIndex];
    const nextWaypoint = routeWaypoints[nextWaypointIndex];
    
    // Interpolación entre waypoints para suavizar la ruta
    const subProgress = (progress * (routeWaypoints.length - 1)) - waypointIndex;
    const lat = currentWaypoint.lat + (nextWaypoint.lat - currentWaypoint.lat) * subProgress;
    const lng = currentWaypoint.lng + (nextWaypoint.lng - currentWaypoint.lng) * subProgress;
    
    const arrivalTime = new Date();
    arrivalTime.setHours(arrivalTime.getHours() + Math.floor(progress * 5)); // 5 horas de viaje
    
    points.push({
      coordinates: { lat, lng },
      arrivalTime,
      distance: 500000 * progress, // 500 km total
      duration: 18000 * progress, // 5 horas en segundos
    });
  }
  
  return {
    points,
    totalDistance,
    totalDuration,
    polyline: 'mock_polyline_data',
  };
};

export const generateMockWeatherPoints = (routeData: RouteData): WeatherPoint[] => {
  const weatherConditions = [
    { description: 'cielo despejado', icon: '01d', temp: 22 },
    { description: 'pocas nubes', icon: '02d', temp: 24 },
    { description: 'nubes dispersas', icon: '03d', temp: 23 },
    { description: 'lluvia ligera', icon: '10d', temp: 20 },
    { description: 'tormenta eléctrica', icon: '11d', temp: 18 },
  ];
  
  return routeData.points.map((point, index) => {
    const weather = weatherConditions[index % weatherConditions.length];
    
    return {
      coordinates: point.coordinates,
      weather: {
        coordinates: point.coordinates,
        temperature: weather.temp + Math.random() * 5 - 2.5, // Variación de ±2.5°C
        humidity: 50 + Math.random() * 30, // 50-80%
        windSpeed: 2 + Math.random() * 15, // 2-17 m/s
        description: weather.description,
        icon: weather.icon,
        arrivalTime: point.arrivalTime,
      },
      arrivalTime: point.arrivalTime,
    };
  });
};
