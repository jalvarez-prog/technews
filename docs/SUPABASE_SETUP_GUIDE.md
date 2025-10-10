# 📚 Guía de Configuración de Supabase para TechHub News

## 🚀 Configuración Paso a Paso

### Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub o con tu email
4. Confirma tu email si es necesario

### Paso 2: Crear Nuevo Proyecto

1. En el dashboard, haz clic en "New Project"
2. Completa los siguientes campos:
   - **Name**: `techhub-news` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y guárdala
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Pricing Plan**: Free tier (500MB storage, 2GB bandwidth)

3. Haz clic en "Create new project" y espera ~2 minutos

### Paso 3: Obtener Credenciales del Proyecto

1. Una vez creado, ve a **Settings > API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJI...`
   - **Service Role Key**: `eyJhbGciOiJI...` (guárdala de forma segura)

### Paso 4: Configurar Variables de Entorno

1. Abre el archivo `.env` en tu proyecto local
2. Actualiza con tus credenciales reales:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aquí
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a git. Ya está en `.gitignore`.

### Paso 5: Ejecutar Scripts de Base de Datos

#### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en "New Query"
3. Ejecuta los scripts en este orden:

**Script 1: Esquema Principal**
- Copia el contenido de `supabase/migrations/001_create_news_schema.sql`
- Pega en el editor SQL
- Haz clic en "Run" o presiona Ctrl+Enter
- Deberías ver "Success. No rows returned"

**Script 2: Políticas de Seguridad**
- Crea una nueva query
- Copia el contenido de `supabase/migrations/002_security_policies.sql`
- Ejecuta el script
- Verifica que se crearon las políticas en **Authentication > Policies**

**Script 3: Limpieza Automática**
- Primero, habilita pg_cron en **Database > Extensions**
- Busca "pg_cron" y actívalo si no está activo
- Luego ejecuta `supabase/migrations/003_cleanup_cron.sql`

#### Opción B: Usando Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Conectar con tu proyecto
supabase link --project-ref tu-proyecto-id

# Ejecutar migraciones
supabase db push
```

### Paso 6: Verificar la Configuración

1. **Verificar Tablas**: Ve a **Table Editor** y confirma que existen:
   - `news`
   - `ticker_stats`
   - `feed_updates`
   - `cleanup_logs`
   - `api_rate_limits`

2. **Verificar Vistas**: En SQL Editor, ejecuta:
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';
```
Deberías ver:
- `news_formatted`
- `ticker_news`
- `cleanup_status`
- `news_statistics`

3. **Verificar Funciones**: En SQL Editor, ejecuta:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

4. **Verificar Políticas RLS**: Ve a **Authentication > Policies**
   - Deberías ver políticas para cada tabla

### Paso 7: Configurar CORS (para producción)

1. Ve a **Settings > API**
2. En la sección "CORS", añade tu dominio de Vercel:
   - `https://tu-app.vercel.app`
   - `http://localhost:5173` (para desarrollo)

### Paso 8: Insertar Datos de Prueba

Ejecuta este script en SQL Editor para añadir noticias de ejemplo:

```sql
-- Insertar noticias de prueba
SELECT insert_news_safe(
    'OpenAI lanza GPT-5 con capacidades revolucionarias',
    'La nueva versión del modelo de lenguaje promete un salto cualitativo en comprensión y razonamiento.',
    'https://example.com/openai-gpt5',
    NOW() - INTERVAL '2 hours',
    'TechCrunch',
    'ai',
    'https://picsum.photos/800/400?random=1',
    NULL,
    TRUE,  -- is_featured
    'hot',
    ARRAY['ai', 'openai', 'gpt5']
);

SELECT insert_news_safe(
    'Vulnerabilidad crítica descubierta en Apache Log4j',
    'Se ha detectado una nueva vulnerabilidad que afecta a millones de servidores en todo el mundo.',
    'https://example.com/log4j-vulnerability',
    NOW() - INTERVAL '4 hours',
    'The Hacker News',
    'cybersecurity',
    'https://picsum.photos/800/400?random=2',
    NULL,
    TRUE,  -- is_featured
    'critical',
    ARRAY['security', 'vulnerability', 'apache']
);

-- Añadir más noticias para cada categoría...
```

### Paso 9: Probar la Conexión desde el Frontend

1. Inicia tu aplicación local:
```bash
npm run dev
```

2. Abre la consola del navegador (F12)

3. Verifica que no hay errores de conexión a Supabase

4. Si hay errores, verifica:
   - Las variables de entorno están correctamente configuradas
   - El proyecto de Supabase está activo
   - Las políticas RLS permiten lectura pública

## 🔧 Configuración Adicional

### Habilitar Realtime (Opcional)

Para actualizaciones en tiempo real:

1. Ve a **Database > Replication**
2. Habilita replication para la tabla `news`
3. En el frontend, usa:

```typescript
const channel = supabase
  .channel('news-changes')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'news' },
    (payload) => console.log('Nueva noticia:', payload)
  )
  .subscribe();
```

### Configurar Backups Automáticos

1. Ve a **Settings > Backups**
2. Los backups diarios están habilitados por defecto en el plan gratuito
3. Puedes descargar backups manualmente si es necesario

### Monitoreo y Logs

1. **Ver Logs de API**: Settings > Logs > API Logs
2. **Ver Logs de Base de Datos**: Settings > Logs > Postgres Logs
3. **Monitorear Uso**: Settings > Usage
   - Storage usado
   - Bandwidth consumido
   - Requests de API

### Configurar Email (para notificaciones)

1. Ve a **Settings > Email**
2. Configura tu proveedor de email (SendGrid, Mailgun, etc.)
3. Útil para notificaciones de errores en limpieza

## 📊 Queries Útiles para Administración

### Ver estadísticas de noticias
```sql
SELECT * FROM news_statistics;
```

### Ver estado de limpieza
```sql
SELECT * FROM cleanup_status;
```

### Ejecutar limpieza manual (dry run)
```sql
SELECT * FROM manual_cleanup(dry_run => true);
```

### Ver últimas noticias insertadas
```sql
SELECT id, title, source, category, pub_date 
FROM news 
ORDER BY created_at DESC 
LIMIT 10;
```

### Ver noticias del ticker
```sql
SELECT * FROM ticker_news;
```

## 🚨 Troubleshooting Común

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de cambiar `.env`

### Error: "permission denied for table news"
- Verifica que las políticas RLS están correctamente configuradas
- Asegúrate de usar la anon key en el frontend, no la service key

### Las noticias no se muestran
- Verifica que hay datos en la tabla con: `SELECT COUNT(*) FROM news;`
- Revisa la consola del navegador para errores de red
- Verifica CORS si estás en producción

### Cron jobs no funcionan
- Asegúrate de que pg_cron está habilitado
- Verifica los jobs con: `SELECT * FROM cron.job;`
- Revisa logs en: `SELECT * FROM cleanup_logs ORDER BY executed_at DESC;`

## 🔐 Seguridad - Mejores Prácticas

1. **Nunca expongas la Service Role Key** en el frontend
2. **Usa RLS** para todas las tablas
3. **Implementa rate limiting** para prevenir abuso
4. **Valida todos los inputs** en funciones de base de datos
5. **Monitorea el uso** regularmente para detectar anomalías
6. **Configura alertas** para errores críticos
7. **Realiza backups** antes de cambios importantes

## 📈 Límites del Plan Gratuito

- **Storage**: 500MB
- **Bandwidth**: 2GB/mes
- **Requests**: 500K/mes
- **Usuarios simultáneos**: 100
- **Edge Functions**: 500K invocaciones/mes

Para el MVP de TechHub, estos límites deberían ser suficientes para:
- ~10,000 noticias almacenadas
- ~50,000 visitas mensuales
- Actualizaciones cada hora

## 🎯 Próximos Pasos

1. ✅ Configurar Supabase
2. ⏳ Implementar servicio de scraping de noticias
3. ⏳ Conectar frontend con base de datos real
4. ⏳ Configurar actualizaciones automáticas
5. ⏳ Implementar búsqueda y filtros avanzados
6. ⏳ Añadir analytics y métricas
7. ⏳ Optimizar rendimiento con caché

## 📞 Soporte

- **Documentación Supabase**: https://supabase.com/docs
- **Discord de Supabase**: https://discord.supabase.com
- **GitHub Issues**: Para problemas específicos del proyecto