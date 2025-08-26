# 🚨 Solución de Problemas de Deploy en Netlify

## ❌ **Error: "Build script returned non-zero exit code: 2"**

### **Problema:**
El build falla en Netlify aunque funciona localmente.

### **Causas Posibles:**
1. **TypeScript errors** que no se muestran localmente
2. **Dependencias faltantes** en el entorno de Netlify
3. **Variables de entorno** no configuradas correctamente
4. **Configuración de Node.js** incompatible

## 🔧 **Soluciones:**

### **Solución 1: Usar Script Simplificado**

Cambia el comando de build en Netlify a:
```
npm run build
```

En lugar de:
```
tsc && vite build
```

### **Solución 2: Configurar Variables de Entorno**

**IMPORTANTE:** Configura estas variables en Netlify ANTES del deploy:

```
VITE_GOOGLE_MAPS_API_KEY=AlzaSyAfI7Ja483LWfUaYyieuRDQRsKs4sdP8vQ
VITE_OPENWEATHER_API_KEY=fb91fbfe1192212a0596d78e46553858
```

### **Solución 3: Verificar Configuración de Netlify**

En la configuración del sitio en Netlify:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### **Solución 4: Usar Configuración Alternativa**

Si el problema persiste, usa `netlify.toml.simple`:

1. Renombra `netlify.toml` a `netlify.toml.backup`
2. Renombra `netlify.toml.simple` a `netlify.toml`
3. Haz commit y push
4. Intenta el deploy nuevamente

## 🛠️ **Pasos de Verificación:**

### **1. Verificar Build Local:**
```bash
npm run build
```

### **2. Verificar TypeScript:**
```bash
npx tsc --noEmit
```

### **3. Verificar Dependencias:**
```bash
npm ci
npm run build
```

## 📋 **Checklist de Deploy:**

- [ ] Variables de entorno configuradas en Netlify
- [ ] Build funciona localmente (`npm run build`)
- [ ] No hay errores de TypeScript críticos
- [ ] Node.js versión 18 configurada
- [ ] Comando de build: `npm run build`
- [ ] Directorio de publicación: `dist`

## 🚀 **Deploy Manual:**

Si el deploy automático falla:

1. **Ve a Netlify Dashboard**
2. **Selecciona tu sitio**
3. **Ve a "Deploys"**
4. **Haz clic en "Trigger deploy"**
5. **Selecciona "Deploy site"**

## 🔍 **Logs de Debug:**

Para ver logs detallados:

1. **En Netlify Dashboard**
2. **Ve a "Deploys"**
3. **Haz clic en el deploy fallido**
4. **Revisa los logs completos**

## ✅ **Señales de Éxito:**

Cuando el deploy funcione correctamente verás:

```
✓ 1421 modules transformed.
dist/index.html                   0.92 kB │ gzip:   0.51 kB
dist/assets/index-cbdede00.css   14.32 kB │ gzip:   3.37 kB
dist/assets/index-ec656424.js   356.60 kB │ gzip: 112.54 kB
✓ built in 4.10s
```

## 🎯 **Resultado Final:**

Una vez solucionado, tendrás:
- ✅ **Deploy exitoso** en Netlify
- ✅ **Aplicación funcionando** con datos reales
- ✅ **Autocompletado** operativo
- ✅ **Rutas reales** en el mapa
- ✅ **Sin errores** en la consola

---

**¡Con estas soluciones AURA estará funcionando en Netlify! 🚀**
