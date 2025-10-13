# TechHub RSS Scraper - Cron Jobs Documentation

## Overview

El sistema de cron jobs automatiza el proceso de scraping de RSS feeds y mantenimiento de la base de datos. Los jobs están configurados para ejecutarse en diferentes intervalos según su propósito.

## Cron Jobs Disponibles

### 1. RSS Scraping Job (Principal)
- **Frecuencia**: Cada 30 minutos
- **Horario**: `*/30 * * * *`
- **Descripción**: Scraping completo de todos los feeds RSS de todas las categorías
- **Función**: Procesa ~40 feeds y actualiza la base de datos con las últimas noticias

### 2. Quick Update Job (Actualización Rápida)
- **Frecuencia**: Cada 10 minutos
- **Horario**: `*/10 * * * *`
- **Descripción**: Actualización rápida solo de categorías críticas (cybersecurity, ai, finance-crypto)
- **Función**: Mantiene las noticias más importantes actualizadas con mayor frecuencia

### 3. Stats Update Job (Estadísticas)
- **Frecuencia**: Cada hora
- **Horario**: `0 * * * *`
- **Descripción**: Actualiza las estadísticas de noticias por categoría
- **Función**: Genera conteos diarios y totales para cada categoría

### 4. Cleanup Job (Limpieza)
- **Frecuencia**: Diariamente a las 3:00 AM
- **Horario**: `0 3 * * *`
- **Descripción**: Elimina noticias antiguas (más de 30 días)
- **Función**: Mantiene la base de datos optimizada

## Uso

### Iniciar Todos los Cron Jobs

```bash
# Opción 1: Usando npm
npm start

# Opción 2: Directamente con node
node server.js

# Opción 3: Usando el script cron
npm run cron
```

### Ejecutar Jobs Manualmente

```bash
# Ejecutar scraping completo
npm run cron:rss

# Ejecutar actualización rápida
npm run cron:quick

# Ejecutar actualización de estadísticas
npm run cron:stats

# Ejecutar limpieza
npm run cron:cleanup

# O directamente con node
node server.js run rss
node server.js run quick
node server.js run stats
node server.js run cleanup
```

### Ejecutar Solo el Scraper (sin cron)

```bash
npm run scrape
```

## Logs y Monitoreo

Los cron jobs registran su ejecución en la tabla `cron_logs` de Supabase con la siguiente información:
- `job_name`: Nombre del job ejecutado
- `execution_time`: Fecha y hora de ejecución
- `status`: 'success' o 'error'
- `duration_ms`: Duración en milisegundos
- `items_processed`: Número de items procesados
- `error_message`: Mensaje de error (si aplica)

### Consultar Logs en Supabase

```sql
-- Ver últimas ejecuciones
SELECT * FROM cron_logs 
ORDER BY execution_time DESC 
LIMIT 20;

-- Ver errores recientes
SELECT * FROM cron_logs 
WHERE status = 'error' 
ORDER BY execution_time DESC;

-- Estadísticas por job
SELECT 
  job_name,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_runs,
  AVG(duration_ms) as avg_duration_ms,
  MAX(execution_time) as last_run
FROM cron_logs
GROUP BY job_name;
```

## Deployment en Producción

### Usando PM2 (Recomendado)

1. Instalar PM2:
```bash
npm install -g pm2
```

2. Iniciar el servidor de cron:
```bash
pm2 start server.js --name "techhub-cron"
```

3. Guardar configuración:
```bash
pm2 save
pm2 startup
```

### Usando systemd (Linux)

Crear archivo `/etc/systemd/system/techhub-cron.service`:

```ini
[Unit]
Description=TechHub RSS Scraper Cron Service
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/techhub/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /path/to/techhub/backend/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl enable techhub-cron
sudo systemctl start techhub-cron
```

### Variables de Entorno

Asegúrate de tener las siguientes variables en el archivo `.env`:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_service_key
NODE_ENV=production
```

## Troubleshooting

### Los cron jobs no se ejecutan

1. Verifica que el servidor esté corriendo:
```bash
ps aux | grep server.js
```

2. Revisa los logs del proceso:
```bash
# Si usas PM2
pm2 logs techhub-cron

# Si usas systemd
sudo journalctl -u techhub-cron -f
```

### Error de conexión a Supabase

1. Verifica las credenciales en `.env`
2. Asegúrate de que el service key tenga los permisos necesarios
3. Verifica la conexión a internet

### Feeds con errores frecuentes

Algunos feeds pueden retornar errores 403/404. Esto es normal si:
- El feed cambió de URL
- El sitio requiere autenticación
- El sitio bloqueó el acceso automatizado

Solución: Actualizar o remover feeds problemáticos del archivo `rssScraperService.js`.

## Mantenimiento

### Actualizar Lista de Feeds

Editar el objeto `rssFeedsConfig` en `services/rssScraperService.js`:

```javascript
const rssFeedsConfig = {
  'category-name': [
    'https://feed-url-1.com/rss',
    'https://feed-url-2.com/feed'
  ]
};
```

### Cambiar Frecuencia de Jobs

Editar los schedules en `services/cronJobService.js`:

```javascript
// Formato: '* * * * *' (minuto hora día mes díaSemana)
const rssScrapingJob = cron.schedule('*/30 * * * *', async () => {
  // Cambia '*/30' por el intervalo deseado
});
```

### Agregar Nuevo Cron Job

1. Agregar el job en `cronJobService.js`
2. Exportarlo en el módulo
3. Agregarlo a `startAllJobs()` y `stopAllJobs()`
4. Agregar caso en `runJobManually()`
5. Opcionalmente, agregar script en `package.json`