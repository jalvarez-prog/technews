# 📋 Análisis del Frontend TechNews - Documentación de Integración

## 1. AUDITORÍA DEL FRONTEND ACTUAL

### Estructura del Proyecto
```
project/
├── src/
│   ├── components/
│   │   ├── NewsCard.tsx          # Tarjeta individual de noticia
│   │   ├── NewsFeed.tsx          # Grid de noticias
│   │   ├── SlimNewsTicker.tsx    # Ticker de noticias destacadas
│   │   ├── CategoryNewsFeed.tsx  # Feed por categoría
│   │   ├── TrendingNewsSection.tsx # Sección de tendencias
│   │   └── FeaturedNewsCard.tsx  # Tarjeta de noticia destacada
│   ├── hooks/
│   │   └── useNews.ts            # Hook para cargar noticias (actualmente usa mock)
│   ├── data/
│   │   ├── mockNews.ts          # Datos mock actuales
│   │   └── tickerData.ts        # Datos del ticker por categoría
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   └── lib/
│       └── supabase.ts          # Cliente Supabase (ya configurado)
```

### Tecnologías Detectadas
- **Frontend Framework**: React 18.3.1 con TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase (cliente ya instalado)
- **Bundler**: Vite
- **Icons**: Lucide React

## 2. ANÁLISIS DE REQUISITOS DE DATOS

### Estructura de Datos Actual (NewsArticle)
```typescript
interface NewsArticle {
  id: string;              // Identificador único
  title: string;           // Título de la noticia
  description: string;     // Resumen/descripción
  link: string;           // URL externa de la noticia
  pubDate: string;        // Fecha ISO de publicación
  source: string;         // Nombre de la fuente
  category: string;       // Categoría de la noticia
  imageUrl?: string;      // URL de imagen (opcional)
}
```

### Categorías Soportadas
```typescript
type NewsCategory =
  | 'cybersecurity'    // Ciberseguridad
  | 'ai'              // Inteligencia Artificial
  | 'finance-crypto'  // Finanzas y Cripto
  | 'software-devops' // Software y DevOps
  | 'iot'            // Internet de las Cosas
  | 'cloud'          // Cloud Computing
  | 'data-science'   // Ciencia de Datos
  | 'quantum';       // Computación Cuántica
```

### Estructura del Ticker (TickerNewsItem)
```typescript
interface TickerNewsItem {
  id: number;
  title: string;
  category: string;    // Sub-categoría específica
  severity: string;    // 'critical', 'high', 'medium', 'hot', 'trending'
  source: string;
  time: string;       // Tiempo relativo (ej: "2h", "30m")
  icon: string;       // Emoji o ícono
}
```

## 3. PUNTOS DE INTEGRACIÓN IDENTIFICADOS

### Componentes que Consumen Datos:

1. **NewsCard.tsx**
   - Requiere: Todos los campos de NewsArticle
   - Formato fecha: Calcula tiempo relativo (timeAgo)
   - Manejo de imágenes: Fallback si falla la carga

2. **useNews Hook**
   - Actualmente usa mock data con flag `USE_MOCK_DATA = true`
   - Implementa caché en sessionStorage (5 minutos)
   - Preparado para recibir feeds RSS o API

3. **SlimNewsTicker.tsx**
   - Requiere datos del ticker por categoría
   - Usa función `getTickerDataForCategory()`
   - Muestra noticias destacadas/urgentes

4. **CategoryNewsFeed.tsx**
   - Filtra noticias por categoría
   - Usa el hook useNews

## 4. REQUISITOS PARA LA BASE DE DATOS

### Campos Obligatorios
- `id`: UUID único
- `title`: Título (max 500 caracteres)
- `description`: Resumen (max 1000 caracteres)
- `link`: URL única de la fuente
- `pubDate`: Timestamp con timezone
- `source`: Nombre de la fuente
- `category`: Enum de categorías

### Campos Opcionales
- `imageUrl`: URL de imagen
- `content`: Contenido completo (texto largo)
- `is_featured`: Boolean para ticker
- `severity`: Para noticias del ticker
- `tags`: Array de tags

### Campos de Sistema
- `created_at`: Timestamp de creación
- `updated_at`: Última actualización

## 5. CONFIGURACIÓN ACTUAL DE SUPABASE

### Estado Actual
- **Cliente Supabase**: Ya instalado (@supabase/supabase-js v2.57.4)
- **Configuración**: En archivo `.env` (pendiente de credenciales reales)
- **Variables necesarias**:
  - `VITE_SUPABASE_URL`: URL del proyecto
  - `VITE_SUPABASE_ANON_KEY`: Clave anónima pública

### Próximos Pasos
1. Crear cuenta en Supabase
2. Obtener credenciales del proyecto
3. Actualizar archivo `.env` con credenciales reales
4. Crear esquema de base de datos
5. Configurar políticas de seguridad (RLS)
6. Implementar función de limpieza automática

## 6. MIGRACIÓN DE DATOS MOCK A PRODUCCIÓN

### Estrategia de Migración
1. Mantener estructura de datos existente para compatibilidad
2. Cambiar flag `USE_MOCK_DATA` a false en useNews.ts
3. Implementar función de fetch desde Supabase
4. Mantener caché existente en sessionStorage
5. Implementar fallback a mock data si falla la API

### Formato de Fechas
- **Frontend espera**: ISO string (ej: "2024-01-09T10:30:00Z")
- **Función timeAgo**: Calcula diferencia desde Date.now()
- **Ticker**: Usa formato relativo (ej: "2h", "30m")

## 7. OPTIMIZACIONES RECOMENDADAS

### Índices Necesarios
1. **Índice compuesto**: (category, pubDate DESC) - Para listados por categoría
2. **Índice parcial**: WHERE is_featured = true - Para ticker
3. **Índice único**: link - Evitar duplicados
4. **Índice**: pubDate DESC - Ordenamiento general

### Políticas de Caché
- **SessionStorage**: 5 minutos (ya implementado)
- **Database**: Limpieza de noticias > 60 días
- **CDN**: Para imágenes (considerar proxy)

### Límites Recomendados
- **Por categoría**: Máximo 100 noticias activas
- **Ticker**: Máximo 10 noticias destacadas por categoría
- **Paginación**: 20 noticias por página

## 8. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ✅
- [x] Analizar estructura actual
- [x] Documentar requisitos
- [ ] Crear cuenta Supabase
- [ ] Diseñar esquema SQL
- [ ] Configurar RLS
- [ ] Crear función de limpieza

### Fase 2: Integración
- [ ] Actualizar credenciales en .env
- [ ] Modificar useNews hook
- [ ] Crear servicio de Supabase
- [ ] Implementar CRUD operations
- [ ] Testing de integración

### Fase 3: Migración
- [ ] Migrar datos mock a DB
- [ ] Desactivar flag USE_MOCK_DATA
- [ ] Verificar funcionamiento
- [ ] Monitorear performance