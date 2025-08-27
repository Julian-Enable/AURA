# Mejoras en la Búsqueda de Lugares

## Problema Identificado

El sistema de autocompletado estaba limitado a buscar solo ciudades de México debido a:
- `types: '(cities)'` - Solo ciudades
- `components: 'country:mx'` - Restringido a México

Esto impedía buscar países y otros tipos de lugares.

## Soluciones Implementadas

### 1. Servicio de Lugares Mejorado (`src/services/places.ts`)

#### Cambios Principales:
- **Parámetro `searchType`**: Permite especificar el tipo de búsqueda
  - `'all'`: Incluye países, estados, ciudades (por defecto)
  - `'cities'`: Solo ciudades (con prioridad a México)
  - `'countries'`: Enfocado en países y regiones

#### Tipos de Búsqueda Disponibles:
```typescript
// Búsqueda general (incluye países, estados, ciudades)
PlacesService.getAutocompleteSuggestions('mexico', 'all')

// Solo ciudades (prioriza México)
PlacesService.getAutocompleteSuggestions('guadalajara', 'cities')

// Enfocado en países
PlacesService.getAutocompleteSuggestions('españa', 'countries')
```

### 2. Componente AutocompleteInput Mejorado (`src/components/AutocompleteInput.tsx`)

#### Nueva Prop:
- `searchType?: 'all' | 'cities' | 'countries'` - Permite configurar el tipo de búsqueda

#### Uso:
```tsx
<AutocompleteInput
  label="Origen"
  placeholder="Ej: Ciudad de México, México"
  value={origin}
  onChange={setOrigin}
  searchType="all" // Busca países, ciudades, estados
/>
```

### 3. Formulario de Ruta Actualizado (`src/components/RouteForm.tsx`)

- Ambos campos (origen y destino) ahora usan `searchType="all"`
- Placeholders actualizados para mostrar ejemplos más claros

## Beneficios

1. **Búsqueda Global**: Ahora puedes buscar países, estados y ciudades de todo el mundo
2. **Flexibilidad**: Diferentes tipos de búsqueda según el contexto
3. **Mejor UX**: Los usuarios pueden buscar tanto "México" (país) como "Ciudad de México" (ciudad)
4. **Compatibilidad**: Mantiene la funcionalidad existente para ciudades mexicanas

## Configuración de API

Asegúrate de que tu API key de Google Maps tenga habilitados:
- Places API
- Geocoding API
- Maps JavaScript API

## Ejemplos de Búsqueda

### Países:
- "México" → México (país)
- "España" → España (país)
- "Estados Unidos" → Estados Unidos (país)

### Ciudades:
- "Ciudad de México" → Ciudad de México, México
- "Guadalajara" → Guadalajara, Jalisco, México
- "Madrid" → Madrid, España

### Estados/Regiones:
- "Jalisco" → Jalisco, México
- "California" → California, Estados Unidos
