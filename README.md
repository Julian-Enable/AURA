# AURA - Pronóstico de Clima en Ruta 🌤️🗺️

AURA es una aplicación web moderna que combina datos de rutas de Google Maps con pronósticos del clima de OpenWeather para proporcionar información meteorológica detallada a lo largo de cualquier ruta de viaje.

## ✨ Características

- **Integración de Múltiples APIs**: Combina Google Maps Directions API y OpenWeather API
- **Análisis Geo-Temporal**: Calcula el clima en diferentes puntos de la ruta según el tiempo de llegada
- **Visualización Interactiva**: Mapa interactivo con marcadores de clima personalizados
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS
- **TypeScript**: Código completamente tipado para mayor robustez
- **React 18**: Utiliza las últimas características de React

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS
- **Mapas**: Leaflet.js
- **APIs**: Google Maps Directions API, OpenWeather API
- **HTTP Client**: Axios
- **Iconos**: Lucide React

## 📋 Prerrequisitos

Antes de comenzar, necesitas:

1. **Node.js** (versión 16 o superior)
2. **npm** o **yarn**
3. **API Keys**:
   - Google Maps API Key (con Directions API habilitada)
   - OpenWeather API Key

## 🛠️ Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <tu-repositorio>
   cd AURA
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las API Keys**:
   
   Abre el archivo `src/services/api.ts` y reemplaza las siguientes líneas:
   
   ```typescript
   const GOOGLE_MAPS_API_KEY = 'TU_API_KEY_DE_GOOGLE_MAPS';
   const OPENWEATHER_API_KEY = 'TU_API_KEY_DE_OPENWEATHER';
   ```

4. **Ejecuta la aplicación**:
   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en `http://localhost:3000`

## 🔑 Obtención de API Keys

### Google Maps API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Directions API**
4. Ve a "Credenciales" y crea una nueva API Key
5. Restringe la API Key a tu dominio por seguridad

### OpenWeather API Key

1. Ve a [OpenWeather](https://openweathermap.org/api)
2. Regístrate para obtener una cuenta gratuita
3. Ve a "My API Keys" para obtener tu clave
4. La API gratuita incluye 1000 llamadas por día

## 🏗️ Estructura del Proyecto

```
AURA/
├── src/
│   ├── components/          # Componentes React
│   │   ├── RouteForm.tsx    # Formulario de entrada
│   │   ├── WeatherMap.tsx   # Componente del mapa
│   │   └── RouteDetails.tsx # Detalles de la ruta
│   ├── services/            # Servicios de API
│   │   └── api.ts          # Clientes de Google Maps y OpenWeather
│   ├── types/              # Definiciones de TypeScript
│   │   └── index.ts        # Interfaces y tipos
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                 # Archivos estáticos
├── package.json            # Dependencias y scripts
├── tailwind.config.js      # Configuración de Tailwind
├── vite.config.ts          # Configuración de Vite
└── README.md               # Este archivo
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🌟 Cómo Funciona

### 1. Obtención de la Ruta
- El usuario ingresa origen y destino
- Se llama a Google Maps Directions API
- Se decodifica la polyline para obtener coordenadas
- Se dividen en puntos clave (10 puntos por defecto)

### 2. Cálculo de Tiempos
- Se calcula el tiempo de llegada a cada punto
- Se considera la duración total del viaje
- Se distribuyen los puntos uniformemente

### 3. Obtención del Clima
- Para cada punto, se llama a OpenWeather API
- Se obtiene el pronóstico para la hora de llegada
- Se combinan datos de ruta y clima

### 4. Visualización
- Se dibuja la ruta en el mapa
- Se muestran marcadores con iconos de clima
- Se proporcionan detalles en el sidebar

## 🎨 Personalización

### Colores
Los colores principales están definidos en `tailwind.config.js`:
- `aura-blue`: #1e40af
- `aura-sky`: #0ea5e9
- `aura-weather`: #f59e0b

### Iconos de Clima
Los iconos se pueden personalizar en `src/services/api.ts` en la función `getWeatherIcon()`.

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno:
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_OPENWEATHER_API_KEY`
3. Despliega automáticamente

### Netlify
1. Sube tu código a GitHub
2. Conecta el repositorio a Netlify
3. Configura las variables de entorno
4. Despliega

## 🔒 Seguridad

- **Nunca** subas tus API keys al repositorio
- Usa variables de entorno en producción
- Restringe las API keys a tu dominio
- Considera usar un proxy backend para mayor seguridad

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [Google Maps Platform](https://developers.google.com/maps) por la API de direcciones
- [OpenWeather](https://openweathermap.org/) por los datos meteorológicos
- [Leaflet](https://leafletjs.com/) por la librería de mapas
- [Tailwind CSS](https://tailwindcss.com/) por el framework de estilos

## 📞 Soporte

Si tienes alguna pregunta o problema:

1. Revisa la documentación de las APIs
2. Verifica que las API keys estén configuradas correctamente
3. Revisa la consola del navegador para errores
4. Abre un issue en el repositorio

---

**¡Disfruta planificando tus viajes con AURA! 🌤️🗺️**
