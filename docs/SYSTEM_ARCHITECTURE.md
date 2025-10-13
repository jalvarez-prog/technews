# 🏗️ Arquitectura del Sistema TechHub News

## 📋 Visión General

TechHub News es una plataforma de agregación de noticias tecnológicas que recopila, procesa y presenta información de múltiples fuentes RSS en 8 categorías tecnológicas diferentes.

## 🎯 Objetivos del Sistema

1. **Automatización Total**: Actualización automática de contenido sin intervención manual
2. **Alta Disponibilidad**: Sistema 24/7 con mínimo downtime
3. **Escalabilidad**: Capacidad de crecer en fuentes y usuarios
4. **Eficiencia**: Uso óptimo de recursos y almacenamiento
5. **Tiempo Real**: Información actualizada y relevante

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Vercel)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  React App  │  │  TypeScript  │  │  Tailwind   │  │  Vite    │ │
│  └─────────────┘  └──────────────┘  └─────────────┘  └──────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS/REST API
┌────────────────────────────┴────────────────────────────────────────┐
│                        BACKEND SERVICES                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Supabase Platform                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │ PostgreSQL │  │   Auth     │  │  Storage   │            │   │
│  │  │  Database  │  │  Service   │  │  Service   │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │   Edge     │  │  Realtime  │  │   Cron     │            │   │
│  │  │ Functions  │  │  Service   │  │   Jobs     │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │               Automation Layer (N8N Cloud)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │    RSS     │  │   Data     │  │  Scheduler │            │   │
│  │  │  Scraper   │  │ Transform  │  │   24h/5h   │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────────┐
│                      EXTERNAL SOURCES                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │  RSS   │  │  RSS   │  │  RSS   │  │  RSS   │  │  RSS   │       │
│  │ Feed 1 │  │ Feed 2 │  │ Feed 3 │  │ Feed 4 │  │ Feed 5 │ ...   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

## 🗄️ Modelo de Datos

### Tablas Principales

#### 1. **news** - Tabla principal de noticias
```sql
- id: UUID (PK)
- title: VARCHAR(500)
- description: TEXT
- link: TEXT (UNIQUE)
- pub_date: TIMESTAMPTZ
- source: VARCHAR(255)
- category: ENUM (8 categorías)
- image_url: TEXT
- content: TEXT
- is_featured: BOOLEAN
- severity: ENUM (critical, high, medium, low, hot, trending)
- tags: TEXT[]
- view_count: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2. **feed_updates** - Control de actualizaciones
```sql
- id: UUID (PK)
- feed_url: TEXT
- category: ENUM
- last_fetched: TIMESTAMPTZ
- last_successful: TIMESTAMPTZ
- error_count: INTEGER
- last_error: TEXT
- is_active: BOOLEAN
```

#### 3. **ticker_stats** - Estadísticas del ticker
```sql
- id: UUID (PK)
- category: ENUM
- sub_category: VARCHAR(100)
- icon: VARCHAR(10)
- custom_time: VARCHAR(20)
```

#### 4. **cleanup_logs** - Logs de limpieza
```sql
- id: UUID (PK)
- executed_at: TIMESTAMPTZ
- operation: TEXT
- affected_rows: INTEGER
- details: JSONB
- execution_time_ms: INTEGER
- success: BOOLEAN
- error_message: TEXT
```

## 🔄 Flujos de Datos

### 1. **Flujo de Ingesta de Noticias (cada 24 horas)**

```
1. N8N Scheduler → Trigger (00:00 UTC)
2. RSS Parser → Fetch de 5 fuentes por categoría (40 fuentes total)
3. Data Transformer → Normalización de datos
4. Duplicate Checker → Verificación contra DB
5. Supabase Insert → Función insert_news_safe()
6. Cleanup Job → Eliminar noticias > 60 días
7. Analytics Update → Actualizar estadísticas
```

### 2. **Flujo de Actualización del Ticker (cada 5 horas)**

```
1. N8N Scheduler → Trigger (00:00, 05:00, 10:00, 15:00, 20:00 UTC)
2. News Analyzer → Identificar noticias importantes
3. Severity Calculator → Asignar nivel de severidad
4. Featured Updater → Marcar como is_featured = true
5. Ticker Stats → Actualizar iconos y tiempos
6. Cache Invalidation → Limpiar caché del frontend
```

### 3. **Flujo de Consulta de Usuario**

```
1. Usuario → Solicita categoría
2. Frontend → Check sessionStorage (5 min cache)
3. Si no hay cache → Supabase API
4. Supabase → Query optimizada con índices
5. Transform → Formato para UI
6. Display → Renderizar en React
7. Analytics → Incrementar view_count
```

## 🛡️ Seguridad y Políticas

### Row Level Security (RLS)
- **Lectura**: Pública para tabla `news`
- **Escritura**: Solo `service_role` y `news_scraper`
- **Actualización**: Limitada a `view_count` para usuarios anónimos

### API Keys y Secretos
- Almacenados en variables de entorno
- Rotación cada 90 días
- Diferentes keys para dev/staging/prod

## 🚀 Optimizaciones

### Índices de Base de Datos
1. `idx_news_category_pubdate` - Consultas por categoría
2. `idx_news_featured` - Noticias del ticker
3. `idx_news_pubdate` - Ordenamiento temporal
4. `idx_news_tags` - Búsqueda por tags (GIN)

### Caché Strategy
1. **Frontend**: sessionStorage (5 minutos)
2. **CDN**: Imágenes cacheadas (7 días)
3. **Database**: Prepared statements
4. **API**: Response caching (1 minuto)

### Límites y Quotas
- Máximo 100 noticias por categoría
- Limpieza automática > 60 días
- Rate limiting: 100 req/min por IP
- Tamaño máximo de imagen: 5MB

## 📊 Monitoreo y Logs

### Métricas Clave
1. **Disponibilidad**: > 99.9%
2. **Latencia API**: < 200ms p95
3. **Tasa de éxito RSS**: > 95%
4. **Tiempo de actualización**: < 5 min

### Alertas Configuradas
- Fallo en actualización de feeds
- Database storage > 80%
- Error rate > 5%
- Latencia > 500ms

## 🔧 Tecnologías y Herramientas

### Frontend
- **React 18.3**: Framework UI
- **TypeScript 5.5**: Type safety
- **Tailwind CSS 3.4**: Styling
- **Vite 5.4**: Build tool
- **Lucide Icons**: Iconografía

### Backend
- **Supabase**: BaaS principal
- **PostgreSQL 15**: Base de datos
- **pg_cron**: Scheduled jobs
- **PostgREST**: API automática

### Automatización
- **N8N Cloud**: Workflow automation
- **RSS Parser**: Feed processing
- **Node.js**: Custom scripts

### Infraestructura
- **Vercel**: Frontend hosting
- **Supabase Cloud**: Backend hosting
- **Cloudflare**: CDN y DDoS protection

## 📈 Escalabilidad

### Horizontal Scaling
1. **Frontend**: Auto-scaling en Vercel
2. **Database**: Read replicas en Supabase Pro
3. **Automation**: Múltiples workers en N8N

### Vertical Scaling
1. **Supabase Plan**: Free → Pro → Team
2. **Storage**: 500MB → 8GB → 100GB
3. **Bandwidth**: 2GB → 50GB → 500GB

## 🔄 Disaster Recovery

### Backups
- **Database**: Daily snapshots (7 días retention)
- **Code**: Git con branching strategy
- **Configs**: Version control en repositorio

### Recovery Time Objectives
- **RTO**: < 1 hora
- **RPO**: < 24 horas
- **Procedimientos**: Documentados en runbooks

## 🚦 Próximos Pasos

1. **Fase 2**: Implementar búsqueda con Elasticsearch
2. **Fase 3**: Sistema de recomendaciones con ML
3. **Fase 4**: API pública para desarrolladores
4. **Fase 5**: Aplicación móvil nativa

## 📞 Contactos y Soporte

- **Technical Lead**: [email]
- **DevOps**: [email]
- **On-call**: [pager]
- **Documentation**: /docs