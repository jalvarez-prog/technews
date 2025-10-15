# Configuración de n8n para TechHub News

## Requisitos previos

1. **n8n instalado** - Puedes instalarlo con:
   ```bash
   npm install n8n -g
   # o con Docker
   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```

2. **Credenciales de Supabase**:
   - URL de tu proyecto Supabase
   - Service Role Key (no el anon key)

## Instalación de los Workflows

### 1. Iniciar n8n
```bash
n8n start
```
Accede a http://localhost:5678

### 2. Configurar credenciales de Supabase

1. Ve a **Credentials** → **New**
2. Busca "Supabase" 
3. Configura:
   - **Credential Name**: Supabase account
   - **Host**: Tu URL de Supabase (ej: https://xxxxx.supabase.co)
   - **Service Role Secret**: Tu service_role key de Supabase

### 3. Importar los workflows

1. En n8n, ve a **Workflows** → **Import from File**
2. Importa `rss-news-scraper-workflow.json`
3. Importa `ticker-update-workflow.json`

### 4. Configurar variables de entorno (opcional)

Para el workflow del ticker, si quieres notificar al frontend:

```bash
# En tu archivo .env de n8n
FRONTEND_URL=http://localhost:5173
TICKER_API_KEY=tu-api-key-secreta
```

## Descripción de los Workflows

### RSS News Scraper (24 horas)
- **Frecuencia**: Cada 24 horas
- **Función**: 
  - Lee múltiples fuentes RSS
  - Categoriza automáticamente las noticias
  - Detecta severity (critical, hot, trending, etc.)
  - Inserta en Supabase evitando duplicados
  - Extrae tags relevantes

### Ticker Update (4 horas)
- **Frecuencia**: Cada 4 horas
- **Función**:
  - Selecciona las 20 noticias top de las últimas 24h
  - Calcula un score basado en:
    - Tiempo de publicación
    - Número de vistas
    - Severidad de la noticia
  - Actualiza el campo `is_featured` para el ticker
  - Garantiza diversidad de categorías (máx 3 por categoría)
  - Actualiza estadísticas del ticker

## Personalización

### Agregar más fuentes RSS

En el workflow de RSS, puedes agregar más nodos de RSS Feed:
1. Duplica un nodo existente de RSS
2. Cambia la URL
3. Conéctalo al nodo "Merge All Feeds"

### Cambiar la frecuencia

En cada workflow, edita el nodo del trigger:
- Para cambiar de 24h a 12h: `hoursInterval: 12`
- Para cambiar de 4h a 2h: `hoursInterval: 2`

### Ajustar el algoritmo del ticker

En el nodo "Process for Ticker", puedes modificar:
- `maxPerCategory`: Número máximo de noticias por categoría
- Score thresholds: Los valores que determinan qué va al ticker
- Lógica de severity

## Monitoreo

### Ver logs de ejecución
- En n8n, ve a **Executions** para ver el historial
- Los workflows guardan logs en la tabla `cron_logs` de Supabase

### Verificar el ticker
```sql
-- En Supabase SQL Editor
SELECT * FROM news 
WHERE is_featured = TRUE 
ORDER BY updated_at DESC;
```

## Troubleshooting

### Las noticias no se insertan
- Verifica las credenciales de Supabase
- Revisa que las URLs de RSS estén activas
- Comprueba los logs en n8n Executions

### El ticker no se actualiza
- Verifica que haya noticias de las últimas 24h
- Revisa la query SQL en "Get Top News"
- Asegúrate de que los tipos de datos coincidan

### Error de tipos en Supabase
- Verifica que los enums estén creados:
  ```sql
  SELECT * FROM pg_type WHERE typname IN ('news_category', 'news_severity');
  ```

## Ventajas de usar n8n

1. **Visual**: Interfaz drag-and-drop fácil de entender
2. **Flexible**: Fácil agregar o quitar fuentes RSS
3. **Monitoreado**: Historial completo de ejecuciones
4. **Escalable**: Puedes agregar más lógica sin código
5. **Notificaciones**: Fácil agregar alertas por email/Slack
6. **Sin servidor**: Funciona en tu máquina o en la nube