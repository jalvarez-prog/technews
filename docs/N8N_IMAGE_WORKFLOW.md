# 🖼️ Workflow de N8N para Procesamiento Automático de Imágenes

## 📋 Descripción General

Este workflow automatiza la asignación de imágenes relevantes y de alta calidad a las noticias, detectando el tópico de cada noticia mediante análisis de keywords y utilizando fuentes gratuitas de imágenes.

## 🎯 Características

- ✅ **Costo Cero**: Usa APIs gratuitas (Unsplash Source, Pexels Free, Pixabay Free)
- 🎨 **Imágenes Relevantes**: Análisis de contenido para keywords exactas
- 🔄 **Automático**: Se ejecuta cada hora o según necesidad
- 📊 **Inteligente**: Detecta categoría y tópico de cada noticia
- 🚀 **Sin Repetición**: Cada noticia recibe una imagen única

## 🛠️ Configuración del Workflow

### Paso 1: Crear el Workflow en N8N

1. Accede a tu instancia de N8N: http://localhost:5678/
2. Click en **"New Workflow"**
3. Nombra el workflow: **"TechHub - Smart Image Assignment"**

### Paso 2: Configurar los Nodos

#### 📅 Nodo 1: Schedule Trigger
```json
{
  "name": "Schedule Trigger - Every Hour",
  "type": "n8n-nodes-base.scheduleTrigger",
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "hours",
          "hoursInterval": 1
        }
      ]
    }
  },
  "position": [250, 300]
}
```

#### 🔍 Nodo 2: Check Missing Images
```json
{
  "name": "Supabase - Get News Without Images",
  "type": "n8n-nodes-base.supabase",
  "parameters": {
    "operation": "getAll",
    "table": "news",
    "returnAll": false,
    "limit": 20,
    "filters": {
      "conditions": [
        {
          "field": "image_url",
          "condition": "is",
          "value": "null"
        }
      ]
    },
    "options": {
      "select": "id,title,description,category,link"
    }
  },
  "position": [450, 300]
}
```

#### 🧠 Nodo 3: Extract Keywords (Code Node)
```json
{
  "name": "Extract Keywords & Assign Images",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "mode": "runOnceForEachItem",
    "jsCode": "// Mapa de categorías a keywords\nconst TOPIC_KEYWORDS = {\n  'cybersecurity': ['cybersecurity', 'hacker', 'security', 'encryption'],\n  'ai': ['artificial intelligence', 'robot', 'machine learning', 'AI'],\n  'finance-crypto': ['cryptocurrency', 'bitcoin', 'blockchain', 'ethereum'],\n  'software-devops': ['programming', 'coding', 'software', 'developer'],\n  'iot': ['IoT', 'smart device', 'sensor', 'connected'],\n  'cloud': ['cloud computing', 'server', 'data center', 'cloud'],\n  'data-science': ['data science', 'analytics', 'big data', 'statistics'],\n  'quantum': ['quantum computing', 'quantum', 'physics', 'processor']\n};\n\n// Extraer keywords del título\nconst title = $input.item.json.title || '';\nconst description = $input.item.json.description || '';\nconst category = $input.item.json.category || 'tech';\n\nconst text = `${title} ${description}`.toLowerCase();\nlet keywords = [];\n\n// Buscar keywords de la categoría\nconst categoryKeywords = TOPIC_KEYWORDS[category];\nif (categoryKeywords) {\n  for (const keyword of categoryKeywords) {\n    if (text.includes(keyword.toLowerCase())) {\n      keywords.push(keyword);\n      break;\n    }\n  }\n}\n\n// Si no hay coincidencias, usar categoría por defecto\nif (keywords.length === 0) {\n  keywords.push(categoryKeywords ? categoryKeywords[0] : category);\n}\n\n// Extraer palabra importante del título\nconst titleWords = title.split(/\\s+/);\nconst importantWord = titleWords.find(word => {\n  const cleaned = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();\n  return cleaned.length > 4 && \n         !['the', 'and', 'for', 'with', 'from'].includes(cleaned);\n});\n\nif (importantWord) {\n  keywords.push(importantWord);\n}\n\nconst keywordString = keywords.join(' ');\nconst encodedKeywords = encodeURIComponent(keywordString);\n\n// Generar URL de Unsplash (gratuita)\nconst imageUrl = `https://source.unsplash.com/1600x900/?${encodedKeywords},technology`;\n\nreturn {\n  id: $input.item.json.id,\n  title: title,\n  category: category,\n  keywords: keywordString,\n  image_url: imageUrl,\n  processed_at: new Date().toISOString()\n};"
  },
  "position": [650, 300]
}
```

#### 🔄 Nodo 4: Update News with Images
```json
{
  "name": "Supabase - Update News Image",
  "type": "n8n-nodes-base.supabase",
  "parameters": {
    "operation": "update",
    "table": "news",
    "id": "={{ $json.id }}",
    "updateFields": {
      "image_url": "={{ $json.image_url }}",
      "updated_at": "={{ $json.processed_at }}"
    }
  },
  "position": [850, 300]
}
```

#### 📊 Nodo 5: Log Results
```json
{
  "name": "Log Processing Results",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": "const items = $input.all();\n\nconst summary = {\n  total_processed: items.length,\n  timestamp: new Date().toISOString(),\n  news_updated: items.map(item => ({\n    id: item.json.id,\n    title: item.json.title.substring(0, 50),\n    keywords: item.json.keywords,\n    image_url: item.json.image_url\n  }))\n};\n\n// Log to Supabase automation_logs (opcional)\nreturn summary;"
  },
  "position": [1050, 300]
}
```

### Paso 3: Workflow Alternativo con HTTP Request

Si prefieres usar el script de Node.js que creamos:

#### 🌐 Nodo Alternativo: HTTP Request
```json
{
  "name": "Process Images via API",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "http://localhost:3001/api/process-images",
    "options": {
      "bodyContentType": "json"
    },
    "bodyParametersJson": {
      "limit": 50,
      "apiKeys": {
        "pexels": "YOUR_FREE_KEY",
        "pixabay": "YOUR_FREE_KEY"
      }
    }
  },
  "position": [450, 300]
}
```

## 🔑 Configuración de APIs Gratuitas

### Unsplash Source (Sin API Key)
```javascript
// URL directa, no requiere configuración
const imageUrl = `https://source.unsplash.com/1600x900/?${keywords}`;
```

### Pexels (API Key Gratuita)
1. Registrarse en: https://www.pexels.com/api/
2. Obtener API Key gratuita
3. Límite: 200 requests/hora

### Pixabay (API Key Gratuita)
1. Registrarse en: https://pixabay.com/api/docs/
2. Obtener API Key gratuita
3. Límite: 5000 requests/hora

## 📈 Monitoreo y Mejoras

### Dashboard de Estadísticas
```sql
-- Query para Supabase
SELECT 
  category,
  COUNT(*) as total,
  COUNT(image_url) as with_image,
  ROUND(COUNT(image_url)::numeric / COUNT(*) * 100, 2) as percentage
FROM news
GROUP BY category
ORDER BY category;
```

### Verificación de Calidad
```javascript
// Nodo de verificación en N8N
const newsWithImages = await supabase
  .from('news')
  .select('id, title, image_url, category')
  .not('image_url', 'is', null)
  .order('created_at', { ascending: false })
  .limit(10);

// Verificar que las imágenes son válidas
for (const news of newsWithImages) {
  try {
    const response = await fetch(news.image_url, { method: 'HEAD' });
    if (!response.ok) {
      console.log(`Invalid image for: ${news.title}`);
    }
  } catch (error) {
    console.log(`Error checking image for: ${news.title}`);
  }
}
```

## 🚀 Ejecución Manual

Para ejecutar el procesamiento manualmente desde la terminal:

```bash
# Procesar todas las noticias sin imagen
node backend/api/processImages.js

# O usar el script directo
node -e "require('./backend/api/processImages').processAllMissingImages(100)"
```

## 🔧 Troubleshooting

### Problema: Imágenes no se asignan
**Solución**: Verificar que Supabase está accesible y las credenciales son correctas.

### Problema: Imágenes genéricas
**Solución**: Mejorar el análisis de keywords agregando más términos específicos.

### Problema: Rate limits
**Solución**: 
- Reducir frecuencia del schedule
- Distribuir requests entre múltiples APIs
- Implementar caché local

## 📊 Métricas de Éxito

- ✅ **100% de noticias con imagen**
- 🎯 **Relevancia > 80%** (imágenes relacionadas al contenido)
- ⚡ **Procesamiento < 2 seg/noticia**
- 💰 **Costo: $0** (usando APIs gratuitas)

## 🎨 Personalización por Categoría

```javascript
// Estilos visuales por categoría
const categoryStyles = {
  'cybersecurity': 'dark,blue,tech,security',
  'ai': 'futuristic,robot,purple,technology',
  'finance-crypto': 'gold,money,chart,trading',
  'software-devops': 'code,programming,computer,dark',
  'iot': 'smart,device,connected,modern',
  'cloud': 'cloud,server,blue,technology',
  'data-science': 'chart,analytics,visualization,data',
  'quantum': 'quantum,physics,science,purple'
};

// Aplicar estilo en la búsqueda
const style = categoryStyles[category] || 'technology';
const imageUrl = `https://source.unsplash.com/1600x900/?${keywords},${style}`;
```

## 📝 Notas Importantes

1. **Unsplash Source** es completamente gratuito y no requiere API key
2. Las imágenes se actualizan automáticamente cada hora
3. El sistema detecta automáticamente el tópico de cada noticia
4. Se puede ejecutar manualmente cuando sea necesario
5. Compatible con n8n Cloud (plan gratuito)

## 🆘 Soporte

- **N8N Community**: https://community.n8n.io
- **Unsplash Docs**: https://source.unsplash.com
- **Pexels API**: https://www.pexels.com/api/documentation/
- **Pixabay API**: https://pixabay.com/api/docs/