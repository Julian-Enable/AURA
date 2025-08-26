# 🔑 Configuración de API Keys para AURA

## ✅ **API Keys Obtenidas**

### **Google Maps API Key**
```
AlzaSyAfI7Ja483LWfUaYyieuRDQRsKs4sdP8vQ
```

### **OpenWeather API Key**
```
fb91fbfe1192212a0596d78e46553858
```

## 🌐 **Configuración para Netlify**

### **Variables de Entorno a Configurar:**

Cuando hagas el deploy en Netlify, configura estas variables de entorno:

```
VITE_GOOGLE_MAPS_API_KEY=AlzaSyAfI7Ja483LWfUaYyieuRDQRsKs4sdP8vQ
VITE_OPENWEATHER_API_KEY=fb91fbfe1192212a0596d78e46553858
```

## 🔧 **Pasos Restantes**

### **1. Obtener OpenWeather API Key**
1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Regístrate para obtener una cuenta gratuita
3. Ve a "My API Keys" en tu perfil
4. Copia la API key generada
5. **Nota:** La API key puede tardar hasta 2 horas en activarse

### **2. Configurar Google Maps API**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Ve a "APIs & Services" → "Credentials"
3. Haz clic en tu API key
4. Configura restricciones:
   - **Application restrictions:** HTTP referrers
   - **Agregar:** `*.netlify.app`
   - **API restrictions:** Selecciona las APIs habilitadas

### **3. APIs a Habilitar en Google Cloud Console**
- ✅ **Directions API**
- ✅ **Maps JavaScript API**
- ✅ **Geocoding API** (opcional)

## 🚀 **Deploy en Netlify**

### **Configuración del Build:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### **Variables de Entorno Finales:**
```
VITE_GOOGLE_MAPS_API_KEY=AlzaSyAfI7Ja483LWfUaYyieuRDQRsKs4sdP8vQ
VITE_OPENWEATHER_API_KEY=fb91fbfe1192212a0596d78e46553858
```

## ✅ **Verificación**

Una vez configurado, deberías ver:
- ✅ Rutas reales en el mapa
- ✅ Datos de clima reales
- ✅ NO el mensaje de "Modo de demostración"
- ✅ Mensajes en consola: "Obteniendo ruta..." y "Obteniendo pronóstico del clima..."

---

**¡Con esto tendrás AURA funcionando como una aplicación real! 🌤️🗺️**
