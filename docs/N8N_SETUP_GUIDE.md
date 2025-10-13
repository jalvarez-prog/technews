# 🤖 Guía de Configuración N8N para TechHub News

## 📋 Introducción

N8N es una plataforma de automatización de workflows open source que usaremos para programar y ejecutar las actualizaciones automáticas de noticias. Esta guía detalla cómo configurar N8N Cloud (versión gratuita) para TechHub.

## 🎯 Objetivos de Automatización

1. **Actualización de Noticias**: Cada 24 horas exactas (00:00 UTC)
2. **Actualización del Ticker**: Cada 5 horas (00:00, 05:00, 10:00, 15:00, 20:00 UTC)
3. **Monitoreo de Errores**: Notificaciones en caso de fallos
4. **Limpieza Automática**: Ejecutar limpieza de base de datos diariamente

## 🚀 Configuración Inicial

### Paso 1: Crear Cuenta en N8N Cloud

1. Visita [https://n8n.cloud](https://n8n.cloud)
2. Registrate con tu email o GitHub
3. Confirma tu cuenta vía email
4. El plan gratuito incluye:
   - 5 workflows activos
   - 100 ejecuciones/mes
   - Suficiente para nuestras necesidades

### Paso 2: Crear Credenciales de Supabase

1. En N8N, ve a **Credentials** > **New**
2. Busca "HTTP Request" (usaremos esto para Supabase)
3. Configura:
   ```
   Name: Supabase API
   Authentication: Header Auth
   Header Auth:
     - Name: apikey
     - Value: [tu_supabase_anon_key]
     - Name: Authorization
     - Value: Bearer [tu_supabase_service_key]
   ```

## 📊 Workflow 1: Actualización de Noticias (24h)

### Configuración del Workflow

```json
{
  "name": "TechHub - News Update 24h",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 0,
              "triggerAtMinute": 0
            }
          ]
        }
      }
    },
    {
      "name": "HTTP Request - Trigger Scraper",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-scraper-endpoint.vercel.app/api/scrape",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "action",
              "value": "scrape_all_feeds"
            }
          ]
        }
      }
    },
    {
      "name": "Parse Response",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "={{$json.success ? 'success' : 'failed'}}"
            },
            {
              "name": "newsCount",
              "value": "={{$json.totalNews}}"
            }
          ]
        }
      }
    },
    {
      "name": "Supabase - Log Execution",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "{{$credentials.supabase_url}}/rest/v1/automation_logs",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "workflow",
              "value": "news_update_24h"
            },
            {
              "name": "status",
              "value": "={{$node['Parse Response'].json.status}}"
            },
            {
              "name": "details",
              "value": "={{$node['Parse Response'].json}}"
            }
          ]
        }
      }
    }
  ]
}
```

## 📊 Workflow 2: Actualización del Ticker (5h)

```json
{
  "name": "TechHub - Ticker Update 5h",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 0,
              "triggerAtMinute": 0
            },
            {
              "triggerAtHour": 5,
              "triggerAtMinute": 0
            },
            {
              "triggerAtHour": 10,
              "triggerAtMinute": 0
            },
            {
              "triggerAtHour": 15,
              "triggerAtMinute": 0
            },
            {
              "triggerAtHour": 20,
              "triggerAtMinute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Update Ticker Features",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://your-api.vercel.app/api/ticker/update",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "action",
              "value": "update_featured_news"
            }
          ]
        }
      }
    }
  ]
}
```

## 🔧 Workflow 3: Limpieza Diaria

```json
{
  "name": "TechHub - Daily Cleanup",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 3,
              "triggerAtMinute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Execute Cleanup",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "{{$credentials.supabase_url}}/rest/v1/rpc/scheduled_cleanup",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth"
      }
    }
  ]
}
```

## 🚨 Workflow 4: Monitor de Errores

```json
{
  "name": "TechHub - Error Monitor",
  "nodes": [
    {
      "name": "Error Trigger",
      "type": "n8n-nodes-base.errorTrigger",
      "parameters": {}
    },
    {
      "name": "Format Error",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "errorMessage",
              "value": "Workflow: {{$json.workflow.name}}\nError: {{$json.error.message}}\nTime: {{$now}}"
            }
          ]
        }
      }
    },
    {
      "name": "Send Email Alert",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "fromEmail": "alerts@techhub.com",
        "toEmail": "admin@techhub.com",
        "subject": "TechHub Automation Error",
        "text": "={{$node['Format Error'].json.errorMessage}}"
      }
    }
  ]
}
```

## 🔑 Variables de Entorno en N8N

Configura estas variables en N8N Cloud:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SCRAPER_API_URL=https://your-api.vercel.app/api
ADMIN_EMAIL=admin@techhub.com
```

## 📈 Monitoreo y Logs

### Dashboard de N8N
- Revisa ejecuciones en **Executions**
- Configura notificaciones en **Settings > Notifications**
- Activa logs detallados para debugging

### Métricas a Monitorear
1. **Tasa de éxito**: > 95%
2. **Tiempo de ejecución**: < 5 minutos
3. **Noticias procesadas**: > 100 por día
4. **Errores de feed**: < 5%

## 🛠️ Alternativas a N8N

Si prefieres otras opciones:

### 1. **GitHub Actions** (Gratuito)
```yaml
name: Update News
on:
  schedule:
    - cron: '0 0 * * *'  # Cada 24 horas
    - cron: '0 */5 * * *'  # Cada 5 horas

jobs:
  update-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run scraper
        run: |
          npm install
          node backend/services/rssScraperService.js
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### 2. **Pipedream** (Gratuito hasta 10,000 invocaciones/mes)
- Similar a N8N pero más simple
- Integración directa con Supabase
- UI más amigable

### 3. **Zapier** (Plan gratuito limitado)
- Más conocido pero más caro
- 100 tasks/mes en plan gratuito
- Fácil de configurar

### 4. **Supabase Edge Functions + Cron**
```typescript
// supabase/functions/news-updater/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { scrapeAllFeeds } from "./scraper.ts"

serve(async (req) => {
  const { action } = await req.json()
  
  if (action === 'update_news') {
    const result = await scrapeAllFeeds()
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  }
})

// Configurar cron en Supabase Dashboard
```

## 🎯 Mejores Prácticas

1. **Idempotencia**: Asegurar que ejecutar múltiples veces no cause duplicados
2. **Timeouts**: Configurar timeouts apropiados (5 min máximo)
3. **Retry Logic**: Reintentar feeds fallidos hasta 3 veces
4. **Rate Limiting**: No exceder 10 requests/segundo a feeds
5. **Logging**: Registrar todas las ejecuciones para auditoría

## 📞 Soporte

- **N8N Docs**: https://docs.n8n.io
- **N8N Community**: https://community.n8n.io
- **Discord**: https://discord.gg/n8n