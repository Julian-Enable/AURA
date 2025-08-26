# 🚀 Deploy de AURA en Netlify - Guía Completa

## 📋 **Requisitos Previos**

### ✅ **Lo que necesitas tener:**
- Cuenta en [Netlify](https://netlify.com) (gratuita)
- Cuenta en [Google Cloud Console](https://console.cloud.google.com)
- Cuenta en [OpenWeatherMap](https://openweathermap.org/api)
- Repositorio de GitHub con el código de AURA

## 🔑 **Paso 1: Obtener las API Keys**

### **1.1 Google Maps API Key**

1. **Crear proyecto en Google Cloud Console:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Anota el **Project ID**

2. **Habilitar APIs necesarias:**
   - Ve a "APIs & Services" → "Library"
   - Busca y habilita estas APIs:
     - ✅ **Directions API**
     - ✅ **Maps JavaScript API**
     - ✅ **Geocoding API** (opcional, para mejor geocodificación)

3. **Crear API Key:**
   - Ve a "APIs & Services" → "Credentials"
   - Haz clic en "Create Credentials" → "API Key"
   - Copia la API key generada

4. **Configurar restricciones (Recomendado):**
   - Haz clic en la API key creada
   - En "Application restrictions" selecciona "HTTP referrers"
   - Agrega tu dominio de Netlify: `*.netlify.app`
   - En "API restrictions" selecciona las APIs que habilitaste

### **1.2 OpenWeather API Key**

1. **Registrarse en OpenWeatherMap:**
   - Ve a [OpenWeatherMap](https://openweathermap.org/api)
   - Haz clic en "Sign Up" y crea una cuenta gratuita
   - Confirma tu email

2. **Obtener API Key:**
   - Ve a "My API Keys" en tu perfil
   - Copia la API key generada
   - **Nota:** La API key puede tardar hasta 2 horas en activarse

## 🏗️ **Paso 2: Preparar el Proyecto**

### **2.1 Verificar archivos de configuración**

Asegúrate de que estos archivos estén en tu repositorio:

- ✅ `netlify.toml` (ya existe)
- ✅ `package.json` (ya existe)
- ✅ `vite.config.ts` (ya existe)

### **2.2 Verificar que el build funcione localmente**

```bash
npm run build
```

Si el build es exitoso, estás listo para el deploy.

## 🌐 **Paso 3: Deploy en Netlify**

### **3.1 Conectar repositorio**

1. Ve a [Netlify](https://netlify.com) y haz login
2. Haz clic en "New site from Git"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio de AURA

### **3.2 Configurar build settings**

Netlify debería detectar automáticamente la configuración, pero verifica:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 (o la que uses)

### **3.3 Configurar variables de entorno**

**IMPORTANTE:** Haz esto ANTES de hacer el deploy.

1. En la página de configuración del build, busca "Environment variables"
2. Agrega estas variables:

```
VITE_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui
VITE_OPENWEATHER_API_KEY=tu_openweather_api_key_aqui
```

### **3.4 Hacer el deploy**

1. Haz clic en "Deploy site"
2. Espera a que termine el build
3. Tu sitio estará disponible en `https://tu-sitio.netlify.app`

## 🔧 **Paso 4: Verificar que Funcione**

### **4.1 Probar la aplicación**

1. Ve a tu sitio desplegado
2. Prueba buscar una ruta (ej: "Ciudad de México" a "Guadalajara")
3. Deberías ver:
   - ✅ Ruta real en el mapa
   - ✅ Datos de clima reales
   - ✅ NO el mensaje de "Modo de demostración"

### **4.2 Verificar en la consola**

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes como:
   - ✅ "Obteniendo ruta..."
   - ✅ "Obteniendo pronóstico del clima..."
   - ❌ NO deberías ver "Usando modo de demostración..."

## 🚨 **Solución de Problemas**

### **Problema: "Modo de demostración activado"**

**Causa:** Las API keys no están configuradas correctamente.

**Solución:**
1. Verifica que las variables de entorno estén configuradas en Netlify
2. Verifica que las API keys sean válidas
3. Reinicia el deploy

### **Problema: "Network Error"**

**Causa:** Problemas con las APIs o keys inválidas.

**Solución:**
1. Verifica que las APIs estén habilitadas en Google Cloud Console
2. Verifica que las restricciones de la API key permitan tu dominio
3. Verifica que la OpenWeather API key esté activa (puede tardar 2 horas)

### **Problema: Build falla**

**Causa:** Problemas en el código o dependencias.

**Solución:**
1. Ejecuta `npm run build` localmente para ver errores
2. Verifica que todas las dependencias estén en `package.json`
3. Verifica que no haya errores de TypeScript

## 📊 **Monitoreo y Mantenimiento**

### **4.1 Verificar uso de APIs**

- **Google Maps:** Ve a Google Cloud Console → APIs & Services → Dashboard
- **OpenWeather:** Ve a tu perfil en OpenWeatherMap → "API usage"

### **4.2 Límites gratuitos**

- **Google Maps:** $200 de crédito mensual (suficiente para uso personal)
- **OpenWeather:** 1,000 llamadas por día (suficiente para uso personal)

### **4.3 Actualizaciones**

Para actualizar el sitio:
1. Haz push a tu repositorio de GitHub
2. Netlify automáticamente hará un nuevo deploy

## 🎯 **Configuración Avanzada**

### **Dominio personalizado**

1. Ve a "Domain settings" en Netlify
2. Agrega tu dominio personalizado
3. Actualiza las restricciones de la API key de Google Maps

### **Variables de entorno adicionales**

Puedes agregar más configuración:

```
VITE_APP_NAME=AURA
VITE_APP_DESCRIPTION=Pronóstico de Clima en Ruta
VITE_WEATHER_UNITS=metric
VITE_WEATHER_LANG=es
```

## ✅ **Checklist Final**

- [ ] API key de Google Maps obtenida y configurada
- [ ] API key de OpenWeather obtenida y configurada
- [ ] Variables de entorno configuradas en Netlify
- [ ] Deploy exitoso
- [ ] Aplicación funciona con datos reales
- [ ] No aparece "Modo de demostración"

---

**¡Con esto tendrás AURA funcionando como una aplicación real en producción! 🌤️🗺️**
