import { useState } from 'react';
import { RouteService, WeatherService } from './services/api';
import { RouteData, WeatherPoint } from './types';
import RouteForm from './components/RouteForm';
import WeatherMap from './components/WeatherMap';
import RouteDetails from './components/RouteDetails';
import { CloudRain, AlertCircle, Play } from 'lucide-react';
import { generateMockRouteData, generateMockWeatherPoints } from './utils/mockData';
import { validateConfig } from './config/env';

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [weatherPoints, setWeatherPoints] = useState<WeatherPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (origin: string, destination: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar si las API keys están configuradas
      const configValid = validateConfig();
      
      if (!configValid) {
        // Usar datos de ejemplo si las API keys no están configuradas
        console.log('Usando modo de demostración...');
        const mockRoute = generateMockRouteData(origin, destination);
        const mockWeather = generateMockWeatherPoints(mockRoute);
        
        setRouteData(mockRoute);
        setWeatherPoints(mockWeather);
        setError('🎯 Modo de demostración activado. Los datos mostrados son simulados. Para usar datos reales, configura las API keys.');
        return;
      }
      
      // Paso 1: Obtener la ruta
      console.log('Obteniendo ruta...');
      const route = await RouteService.getRoute(origin, destination);
      setRouteData(route);
      
      // Paso 2: Obtener el clima para cada punto de la ruta
      console.log('Obteniendo pronóstico del clima...');
      const weatherData = await WeatherService.getWeatherForRoute(route);
      
      // Paso 3: Combinar datos de ruta y clima
      const combinedWeatherPoints: WeatherPoint[] = route.points.map((point, index) => ({
        coordinates: point.coordinates,
        weather: weatherData[index],
        arrivalTime: point.arrivalTime,
      }));
      
      setWeatherPoints(combinedWeatherPoints);
      console.log('Análisis completado exitosamente');
      
    } catch (err) {
      console.error('Error en el análisis:', err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      setRouteData(null);
      setWeatherPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      const mockRoute = generateMockRouteData('Ciudad de México', 'Guadalajara');
      const mockWeather = generateMockWeatherPoints(mockRoute);
      
      setRouteData(mockRoute);
      setWeatherPoints(mockWeather);
      setError('🎯 Modo de demostración activado. Los datos mostrados son simulados.');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="aura-gradient text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CloudRain className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">AURA</h1>
                <p className="text-blue-100 text-sm">Pronóstico de Clima en Ruta</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Planifica tu viaje con inteligencia</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <RouteForm onSearch={handleSearch} loading={loading} />
            
            {/* Botón de demostración */}
            <div className="weather-card">
              <div className="flex items-center mb-4">
                <Play className="w-5 h-5 text-aura-blue mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Modo Demostración</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Prueba la aplicación con datos simulados sin necesidad de configurar API keys.
              </p>
              <button
                onClick={handleDemo}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Ver Demostración
                  </>
                )}
              </button>
            </div>
            
            {routeData && weatherPoints.length > 0 && (
              <RouteDetails routeData={routeData} weatherPoints={weatherPoints} />
            )}
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="weather-card h-full">
              <div className="flex items-center mb-4">
                <CloudRain className="w-5 h-5 text-aura-blue mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Mapa de Ruta y Clima</h2>
              </div>
              
                             {error && (
                 <div className={`mb-4 p-4 border rounded-lg ${
                   error.includes('Modo de demostración') 
                     ? 'bg-blue-50 border-blue-200' 
                     : 'bg-red-50 border-red-200'
                 }`}>
                   <div className="flex items-center">
                     {error.includes('Modo de demostración') ? (
                       <CloudRain className="w-5 h-5 text-blue-500 mr-2" />
                     ) : (
                       <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                     )}
                     <p className={error.includes('Modo de demostración') ? 'text-blue-700' : 'text-red-700'}>
                       {error}
                     </p>
                   </div>
                 </div>
               )}

              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aura-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Analizando ruta y obteniendo pronóstico del clima...</p>
                  </div>
                </div>
              )}

              {!loading && !routeData && !error && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <CloudRain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Comienza tu análisis
                    </h3>
                    <p className="text-gray-500">
                      Ingresa tu origen y destino para ver el pronóstico del clima a lo largo de tu ruta
                    </p>
                  </div>
                </div>
              )}

              {routeData && weatherPoints.length > 0 && (
                <WeatherMap routeData={routeData} weatherPoints={weatherPoints} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 AURA - Pronóstico de Clima en Ruta. Desarrollado con React, TypeScript y APIs de OpenStreetMap y OpenWeather.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Proyecto de portafolio que integra datos abiertos y APIs libres
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
