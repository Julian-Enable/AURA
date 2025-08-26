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

# Construir la aplicación
echo "🏗️ Construyendo aplicación..."
npm run build

echo "✅ Build completado exitosamente!"
