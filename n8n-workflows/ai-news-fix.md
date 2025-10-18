# 🔧 Solución para el Error de AI News Feed

## 🚨 Problema
El feed RSS de AI News (`https://www.artificialintelligence-news.com/feed/`) contiene caracteres XML mal formateados que causan el error:
```
Invalid character in entity name Line: 0 Column: 120 Char: =
```

## ✅ Soluciones

### Solución 1: Remover el Feed Problemático (Rápida)

En tu workflow de n8n:

1. **Localiza el nodo "AI News"**
2. **Desconéctalo** del flujo o **elimínalo**
3. O **deshabilítalo** haciendo click derecho → "Deactivate"

### Solución 2: Reemplazar con Feeds Alternativos de AI

En el nodo de configuración de feeds, reemplaza el feed problemático con estos alternativos:

```javascript
// Feeds de AI funcionando correctamente:
'https://syncedreview.com/feed/',
'https://venturebeat.com/ai/feed/', 
'https://www.marktechpost.com/feed/',
'https://thegradient.pub/rss/',
'https://techcrunch.com/category/artificial-intelligence/feed/',
'https://news.mit.edu/rss/topic/artificial-intelligence',
'https://blogs.nvidia.com/feed/',
'https://openai.com/blog/rss.xml'
```

### Solución 3: Usar HTTP Request con Limpieza de XML

Reemplaza el nodo "AI News" RSS Feed con estos nodos:

#### Nodo 1: HTTP Request
```json
{
  "name": "Fetch AI News Raw",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://www.artificialintelligence-news.com/feed/",
    "options": {
      "response": {
        "response": {
          "responseFormat": "text"
        }
      }
    }
  },
  "continueOnFail": true
}
```

#### Nodo 2: Code - Clean XML
```javascript
// Limpiar el XML problemático
const rawXml = $input.first().json.data;

// Limpieza agresiva de caracteres problemáticos
const cleanXml = rawXml
  // Reemplazar entidades HTML mal formadas
  .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);)/gi, '&amp;')
  // Remover caracteres de control
  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  // Limpiar atributos con = sueltos
  .replace(/(\w+)=([^"'\s>]+)(?=\s|>)/g, '$1="$2"')
  // Remover comentarios HTML mal formados
  .replace(/<!--[\s\S]*?-->/g, '')
  // Remover CDATA mal formado
  .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, function(match) {
    return match.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
  });

return [{
  json: {
    cleanedXml: cleanXml,
    category: 'ai',
    source: 'AI News'
  }
}];
```

#### Nodo 3: RSS Parser personalizado
```javascript
const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 30000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  }
});

try {
  const feed = await parser.parseString($json.cleanedXml);
  
  const items = [];
  if (feed && feed.items) {
    feed.items.slice(0, 10).forEach(item => {
      items.push({
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        link: item.link || '',
        pub_date: item.pubDate || new Date().toISOString(),
        category: 'ai',
        source: 'AI News'
      });
    });
  }
  
  return items.map(item => ({ json: item }));
} catch (error) {
  console.error('Error parsing AI News:', error.message);
  return []; // Retornar vacío si falla
}
```

### Solución 4: Configuración Global para Manejar Errores

En el workflow principal, asegúrate de que todos los nodos RSS tengan:

1. **Continue On Fail** activado (en Settings del nodo)
2. **Error Workflow** configurado para notificar fallos
3. **Timeout** configurado a 15 segundos

## 🎯 Recomendación

**Use la Solución 2** - Reemplazar con feeds alternativos es la más simple y confiable.

Los feeds alternativos sugeridos son:
- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
- MIT News AI: `https://news.mit.edu/rss/topic/artificial-intelligence`
- NVIDIA Blog: `https://blogs.nvidia.com/feed/`
- OpenAI Blog: `https://openai.com/blog/rss.xml`

## 📝 Configuración en n8n

Para implementar la solución en tu workflow actual:

1. **Encuentra** el nodo que procesa los feeds de AI
2. **Edita** la lista de URLs
3. **Comenta o elimina**: `https://www.artificialintelligence-news.com/feed/`
4. **Agrega** los feeds alternativos mencionados
5. **Guarda** y **ejecuta** el workflow para probar

## ✅ Verificación

Después de aplicar la solución:

1. Ejecuta el workflow manualmente
2. Verifica que no hay errores en los nodos de AI
3. Confirma que las noticias de AI se están insertando en Supabase

```sql
-- Verificar noticias de AI recientes
SELECT COUNT(*), source 
FROM news 
WHERE category = 'ai' 
  AND created_at > NOW() - INTERVAL '1 day'
GROUP BY source;
```