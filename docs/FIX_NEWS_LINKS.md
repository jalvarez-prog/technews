# Solución para Enlaces de Noticias

## Problema Identificado

Los enlaces de las noticias están apuntando a "example.com" o están vacíos en la base de datos, lo que causa que todos los enlaces redirijan al dominio de ejemplo.

## Diagnóstico

1. **Verificar el estado actual de los enlaces:**
   
   Puedes acceder a la herramienta de diagnóstico navegando a:
   ```
   http://localhost:5173/?debug=newslinks
   ```

   Esto mostrará:
   - Cuántos artículos tienen enlaces válidos
   - Cuántos no tienen enlace
   - Cuántos apuntan a example.com
   - Una tabla detallada con todos los artículos

2. **Sistema de Fallback:**
   
   El sistema ya tiene implementado un fallback automático. Cuando un artículo no tiene enlace válido:
   - Se genera automáticamente una búsqueda en Google con el título del artículo y la fuente
   - Se muestra un pequeño ícono de advertencia (⚠️) indicando que es un enlace alternativo

## Soluciones

### Importante: Restricción de Unicidad

La tabla `news` tiene una restricción de unicidad en la columna `link` (constraint `news_link_key`). Esto significa que no pueden existir dos artículos con el mismo enlace. Hay varias opciones para manejar esto:

### Opción 1: Usar Enlaces de Búsqueda de Google (Más Simple)

1. **Ejecutar el script SQL v2:**
   
   Ve a Supabase Dashboard > SQL Editor y ejecuta:
   ```sql
   -- Contenido del archivo: scripts/fix-news-links-v2.sql
   ```

   Este script:
   - Establece los enlaces vacíos como NULL
   - Genera búsquedas de Google únicas para cada artículo
   - Garantiza que cada artículo tenga un enlace funcional

### Opción 2: Eliminar Temporalmente la Restricción (Avanzado)

1. **Ejecutar el script que maneja la restricción:**
   
   Ve a Supabase Dashboard > SQL Editor y ejecuta:
   ```sql
   -- Contenido del archivo: scripts/fix-news-links-remove-constraint.sql
   ```

   Este script:
   - Elimina temporalmente la restricción de unicidad
   - Actualiza los enlaces con URLs base de las fuentes
   - Maneja duplicados con búsquedas personalizadas
   - Opcionalmente recrea la restricción

2. **Verificar los cambios:**
   
   Después de ejecutar cualquier script, recarga la página o navega a `/?debug=newslinks` para ver los cambios.

### Opción 2: Usar el Sistema de Fallback (Ya Implementado)

Si prefieres no modificar la base de datos, el sistema ya maneja automáticamente los enlaces faltantes:

- Los artículos sin enlace válido mostrarán una búsqueda en Google
- Se indica visualmente con un ícono de advertencia
- Los usuarios pueden hacer clic y serán redirigidos a los resultados de búsqueda relevantes

## Cómo Funciona el Sistema de Enlaces

1. **Validación:** El sistema verifica si el enlace es una URL válida (comienza con http:// o https://)
2. **Fallback:** Si no es válido, genera una búsqueda: `https://www.google.com/search?q={título}+{fuente}`
3. **Tracking:** Se registra si se usó el enlace original o el fallback para análisis

## Recomendaciones

1. **Para contenido real:** Actualizar los enlaces en la base de datos con las URLs reales de los artículos
2. **Para demos/pruebas:** El sistema de fallback es suficiente
3. **Monitoreo:** Usar la herramienta de debug periódicamente para verificar la calidad de los enlaces

## Archivos Relevantes

- `src/utils/linkUtils.ts` - Lógica de validación y fallback de enlaces
- `src/components/NewsCard.tsx` - Componente que muestra las noticias
- `src/components/NewsLinkDebug.tsx` - Herramienta de diagnóstico
- `scripts/fix-news-links.sql` - Script SQL original (genera error por restricción)
- `scripts/fix-news-links-v2.sql` - Script SQL usando búsquedas de Google (recomendado)
- `scripts/fix-news-links-remove-constraint.sql` - Script SQL que maneja la restricción de unicidad
