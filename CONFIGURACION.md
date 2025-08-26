# Configuración de AURA

## Variables de Entorno

Para usar AURA con datos reales, necesitas configurar las siguientes variables de entorno:

### 1. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# API Keys para AURA
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps_aqui
VITE_OPENWEATHER_API_KEY=tu_api_key_de_openweather_aqui

# Configuración de la aplicación
VITE_APP_NAME=AURA
VITE_APP_DESCRIPTION=Pronóstico de Clima en Ruta
```

### 2. Obtener API Keys

#### Google Maps API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Directions API**
4. Ve a "Credenciales" y crea una nueva API Key
5. Restringe la API Key a tu dominio por seguridad

#### OpenWeather API Key
1. Ve a [OpenWeather](https://openweathermap.org/api)
2. Regístrate para obtener una cuenta gratuita
3. Ve a "My API Keys" para obtener tu clave
4. La API gratuita incluye 1000 llamadas por día

### 3. Modo de Demostración

Si no tienes API keys, puedes usar el modo de demostración:
- Haz clic en "Ver Demostración" en la aplicación
- Los datos mostrados serán simulados
- Perfecto para probar la funcionalidad sin configuración

## Solución de Problemas

### Error de dependencias
Si encuentras errores al instalar dependencias:
```bash
npm cache clean --force
npm install
```

### Error de API keys
Si las API keys no funcionan:
1. Verifica que estén correctamente configuradas
2. Asegúrate de que las APIs estén habilitadas
3. Revisa los límites de uso de las APIs

### Error de CORS
Si hay problemas de CORS:
1. Verifica que las API keys estén restringidas correctamente
2. Asegúrate de que el dominio esté en la lista blanca
