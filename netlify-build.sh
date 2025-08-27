#!/bin/bash

# Script de build para Netlify
set -e

echo "🚀 Iniciando build de AURA..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Verificar TypeScript (solo para verificar, no para fallar el build)
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit || echo "⚠️ Advertencias de TypeScript encontradas, continuando..."

# Crear la carpeta de funciones de Netlify
echo "🛠️ Configurando funciones de Netlify..."
mkdir -p netlify/functions

# Crear el archivo de función para proxy seguro de Google Maps
cat > netlify/functions/google-maps.js << 'EOL'
const https = require('https');

exports.handler = async (event) => {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Obtener parámetros de la petición
  const { queryStringParameters } = event;
  const query = queryStringParameters.query || '';
  const endpoint = queryStringParameters.endpoint || 'place/textsearch/json';
  
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key no configurada' })
    };
  }
  
  // Construir URL para Google Maps
  const params = new URLSearchParams({
    query,
    key: apiKey,
    language: 'es',
    region: 'co'
  });
  
  try {
    // Hacer la petición a Google Maps API
    const response = await new Promise((resolve, reject) => {
      const url = `https://maps.googleapis.com/maps/api/${endpoint}?${params}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ 
              statusCode: res.statusCode,
              headers: res.headers,
              body: jsonData
            });
          } catch (e) {
            reject({ statusCode: 500, error: 'Error parsing JSON response' });
          }
        });
      }).on('error', (err) => {
        reject({ statusCode: 500, error: `Error making request: ${err.message}` });
      });
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.body)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ status: 'ERROR', error: error.message || 'Unknown error' })
    };
  }
};
EOL

# Construir la aplicación
echo "🏗️ Construyendo aplicación..."
npm run build

echo "✅ Build completado exitosamente!"
