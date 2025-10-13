# 📋 Instrucciones para Ejecutar la Migración SQL de Automatización

## 🎯 Objetivo
Crear las tablas y funciones necesarias para el sistema de automatización de TechHub News.

## 📝 Pasos a seguir:

### 1. Acceder al SQL Editor de Supabase
- Ve a: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/sql/new
- O desde el dashboard: SQL Editor > New Query

### 2. Habilitar la extensión pg_cron (IMPORTANTE - Hacer primero)
- Ve a: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/database/extensions
- Busca "pg_cron" en la lista
- Click en "Enable" si no está habilitada
- Espera a que se confirme la activación

### 3. Ejecutar la migración
1. Copia TODO el contenido del archivo:
   `supabase/migrations/004_automation_cron_jobs.sql`
   
2. Pega el contenido en el SQL Editor

3. Haz clic en "Run" o presiona Ctrl+Enter

4. Espera a que termine la ejecución (puede tomar 30-60 segundos)

### 4. Verificar la instalación

Ejecuta estas consultas para verificar que todo se creó correctamente:

```sql
-- Verificar tabla automation_logs
SELECT COUNT(*) FROM automation_logs;

-- Verificar vistas
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('automation_status', 'automation_last_run');

-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('automated_news_update', 'automated_ticker_update', 'check_automation_health');

-- Verificar cron jobs (si pg_cron está habilitado)
SELECT * FROM cron.job;
```

### 5. Si hay errores

Si encuentras errores del tipo:
- "relation cron.job does not exist" → pg_cron no está habilitado
- "syntax error" → Ejecuta el SQL por secciones

#### Ejecutar por secciones:
1. Primero: Crear tabla automation_logs (líneas 8-23)
2. Segundo: Crear funciones (líneas 28-161)
3. Tercero: Intentar configurar cron jobs (líneas 167-211)
4. Cuarto: Crear vistas y triggers (líneas 218-350)

## 🔍 Qué crea esta migración:

### Tablas:
- `automation_logs` - Registro de todas las ejecuciones automáticas

### Funciones:
- `automated_news_update()` - Actualiza noticias cada 24h
- `automated_ticker_update()` - Actualiza ticker cada 5h
- `check_automation_health()` - Verifica salud del sistema

### Vistas:
- `automation_status` - Estado agregado de automatizaciones
- `automation_last_run` - Última ejecución de cada workflow

### Cron Jobs (si pg_cron está habilitado):
- Actualización de noticias: Diaria a las 00:00 UTC
- Actualización del ticker: Cada 5 horas
- Limpieza de logs: Mensual

## ⚠️ Notas importantes:

1. **pg_cron es opcional pero recomendado** - Sin él, deberás ejecutar las actualizaciones manualmente
2. **Los cron jobs corren en UTC** - Ajusta según tu zona horaria si es necesario
3. **Para desarrollo local** - Usa `npm run scrape` manualmente

## 🚀 Después de la migración:

1. Ejecuta el scraper para verificar:
   ```bash
   cd backend
   npm run scrape
   ```

2. Verifica los logs de automatización:
   ```sql
   SELECT * FROM automation_logs ORDER BY started_at DESC;
   ```

## 🆘 Troubleshooting:

- **Error "Invalid API key"**: Verifica tu Service Key en el archivo .env
- **Error "permission denied"**: Asegúrate de usar el Service Key, no el anon key
- **Cron jobs no funcionan**: Verifica que pg_cron esté habilitado
- **Tabla no existe**: Ejecuta la migración completa nuevamente

## 📞 Enlaces útiles:

- SQL Editor: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/sql/new
- Extensions: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/database/extensions
- Logs: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/logs/explorer