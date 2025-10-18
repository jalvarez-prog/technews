require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * API para procesar imágenes faltantes
 * Diseñada para ser llamada desde n8n
 */

// Configuración de APIs gratuitas
const IMAGE_SOURCES = {
  unsplash: {
    enabled: true,
    baseUrl: 'https://source.unsplash.com',
    // No requiere API key para uso básico
  },
  pexels: {
    enabled: true,
    apiKey: process.env.PEXELS_API_KEY || 'YOUR_FREE_KEY',
    baseUrl: 'https://api.pexels.com/v1/search'
  },
  pixabay: {
    enabled: true,
    apiKey: process.env.PIXABAY_API_KEY || 'YOUR_FREE_KEY',
    baseUrl: 'https://pixabay.com/api/'
  }
};

// Mapa de tópicos a keywords mejorado
const TOPIC_KEYWORDS = {
  'cybersecurity': {
    primary: ['cybersecurity', 'hacker', 'security', 'encryption', 'firewall'],
    secondary: ['computer security', 'data protection', 'cyber attack', 'network'],
    colors: ['blue', 'dark', 'tech'],
    style: 'technical'
  },
  'ai': {
    primary: ['artificial intelligence', 'robot', 'machine learning', 'neural network'],
    secondary: ['AI', 'automation', 'algorithm', 'deep learning', 'technology'],
    colors: ['blue', 'purple', 'futuristic'],
    style: 'futuristic'
  },
  'finance-crypto': {
    primary: ['cryptocurrency', 'bitcoin', 'blockchain', 'ethereum', 'trading'],
    secondary: ['finance', 'money', 'investment', 'market', 'digital currency'],
    colors: ['gold', 'green', 'blue'],
    style: 'financial'
  },
  'software-devops': {
    primary: ['programming', 'coding', 'software', 'developer', 'devops'],
    secondary: ['computer', 'code', 'technology', 'laptop', 'development'],
    colors: ['blue', 'green', 'dark'],
    style: 'technical'
  },
  'iot': {
    primary: ['IoT', 'smart device', 'sensor', 'connected', 'smart home'],
    secondary: ['internet of things', 'automation', 'wireless', 'technology'],
    colors: ['blue', 'green', 'white'],
    style: 'modern'
  },
  'cloud': {
    primary: ['cloud computing', 'server', 'data center', 'cloud storage'],
    secondary: ['cloud', 'technology', 'network', 'infrastructure'],
    colors: ['blue', 'white', 'light'],
    style: 'technical'
  },
  'data-science': {
    primary: ['data science', 'analytics', 'big data', 'statistics', 'visualization'],
    secondary: ['data', 'analysis', 'dashboard', 'charts', 'graphs'],
    colors: ['blue', 'orange', 'green'],
    style: 'analytical'
  },
  'quantum': {
    primary: ['quantum computing', 'quantum', 'physics', 'quantum processor'],
    secondary: ['quantum technology', 'science', 'atom', 'particle'],
    colors: ['purple', 'blue', 'dark'],
    style: 'scientific'
  }
};

/**
 * Extrae palabras clave relevantes del título y descripción
 */
function extractKeywords(title, description, category) {
  const text = `${title} ${description}`.toLowerCase();
  const keywords = [];
  
  // Obtener keywords predefinidas de la categoría
  const categoryKeywords = TOPIC_KEYWORDS[category];
  if (categoryKeywords) {
    // Buscar keywords primarias en el texto
    for (const keyword of categoryKeywords.primary) {
      if (text.includes(keyword.toLowerCase())) {
        keywords.push(keyword);
        break; // Solo usar la primera coincidencia
      }
    }
    
    // Si no hay coincidencias primarias, usar la primera keyword primaria
    if (keywords.length === 0) {
      keywords.push(categoryKeywords.primary[0]);
    }
  }
  
  // Extraer palabras importantes del título (tecnologías, productos, etc.)
  const titleWords = title.split(/\s+/);
  const importantWords = titleWords.filter(word => {
    const cleaned = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return cleaned.length > 4 && 
           !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'which'].includes(cleaned);
  });
  
  if (importantWords.length > 0) {
    keywords.push(importantWords[0]);
  }
  
  return keywords.join(' ');
}

/**
 * Busca imagen en Unsplash (sin API key)
 */
async function searchUnsplashFree(keywords, category) {
  try {
    // Unsplash Source API - completamente gratuita
    const size = '1600x900';
    const query = encodeURIComponent(keywords);
    
    // Agregar categoría como filtro adicional
    const categoryFilter = TOPIC_KEYWORDS[category]?.style || 'tech';
    const fullQuery = `${query},${categoryFilter}`;
    
    // URL directa a imagen aleatoria relacionada
    const imageUrl = `https://source.unsplash.com/${size}/?${fullQuery}`;
    
    // Verificar que la URL funciona
    const response = await axios.head(imageUrl, { 
      timeout: 5000,
      maxRedirects: 5 
    });
    
    if (response.status === 200) {
      // Obtener la URL final después de redirecciones
      return response.request.res.responseUrl || imageUrl;
    }
  } catch (error) {
    console.error('Unsplash free search error:', error.message);
  }
  return null;
}

/**
 * Busca imagen en Pexels (requiere API key gratuita)
 */
async function searchPexels(keywords, category) {
  if (!IMAGE_SOURCES.pexels.apiKey || IMAGE_SOURCES.pexels.apiKey === 'YOUR_FREE_KEY') {
    return null;
  }
  
  try {
    const response = await axios.get(IMAGE_SOURCES.pexels.baseUrl, {
      headers: {
        'Authorization': IMAGE_SOURCES.pexels.apiKey
      },
      params: {
        query: keywords,
        per_page: 15,
        orientation: 'landscape'
      },
      timeout: 5000
    });
    
    if (response.data.photos && response.data.photos.length > 0) {
      // Seleccionar imagen aleatoria para variedad
      const randomIndex = Math.floor(Math.random() * Math.min(5, response.data.photos.length));
      return response.data.photos[randomIndex].src.large;
    }
  } catch (error) {
    console.error('Pexels search error:', error.message);
  }
  return null;
}

/**
 * Busca imagen en Pixabay (requiere API key gratuita)
 */
async function searchPixabay(keywords, category) {
  if (!IMAGE_SOURCES.pixabay.apiKey || IMAGE_SOURCES.pixabay.apiKey === 'YOUR_FREE_KEY') {
    return null;
  }
  
  try {
    const response = await axios.get(IMAGE_SOURCES.pixabay.baseUrl, {
      params: {
        key: IMAGE_SOURCES.pixabay.apiKey,
        q: keywords,
        image_type: 'photo',
        orientation: 'horizontal',
        category: 'technology',
        per_page: 20,
        safesearch: true
      },
      timeout: 5000
    });
    
    if (response.data.hits && response.data.hits.length > 0) {
      const randomIndex = Math.floor(Math.random() * Math.min(5, response.data.hits.length));
      return response.data.hits[randomIndex].largeImageURL;
    }
  } catch (error) {
    console.error('Pixabay search error:', error.message);
  }
  return null;
}

/**
 * Genera URL de imagen de respaldo con Lorem Picsum
 */
function generateFallbackImage(title, category) {
  // Generar seed único basado en el título
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Dimensiones variadas para evitar monotonía
  const widths = [1600, 1920, 1280, 1440];
  const heights = [900, 1080, 720, 810];
  const idx = seed % widths.length;
  
  return `https://picsum.photos/seed/${seed}/${widths[idx]}/${heights[idx]}`;
}

/**
 * Procesa una noticia individual
 */
async function processNewsImage(news) {
  try {
    // Extraer keywords basadas en el contenido
    const keywords = extractKeywords(news.title, news.description, news.category);
    console.log(`Procesando: "${news.title.substring(0, 50)}..." con keywords: "${keywords}"`);
    
    let imageUrl = null;
    let source = null;
    
    // 1. Intentar Unsplash (gratuito, sin API key)
    imageUrl = await searchUnsplashFree(keywords, news.category);
    if (imageUrl) {
      source = 'unsplash';
    }
    
    // 2. Intentar Pexels si está configurado
    if (!imageUrl && IMAGE_SOURCES.pexels.apiKey !== 'YOUR_FREE_KEY') {
      imageUrl = await searchPexels(keywords, news.category);
      if (imageUrl) {
        source = 'pexels';
      }
    }
    
    // 3. Intentar Pixabay si está configurado
    if (!imageUrl && IMAGE_SOURCES.pixabay.apiKey !== 'YOUR_FREE_KEY') {
      imageUrl = await searchPixabay(keywords, news.category);
      if (imageUrl) {
        source = 'pixabay';
      }
    }
    
    // 4. Usar fallback si todo falla
    if (!imageUrl) {
      imageUrl = generateFallbackImage(news.title, news.category);
      source = 'picsum_fallback';
    }
    
    // Actualizar la noticia con la imagen
    const { error } = await supabase
      .from('news')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', news.id);
    
    if (error) {
      console.error(`Error actualizando noticia ${news.id}:`, error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      newsId: news.id,
      imageUrl: imageUrl,
      source: source,
      keywords: keywords
    };
    
  } catch (error) {
    console.error(`Error procesando noticia ${news.id}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Función principal para procesar noticias sin imagen
 */
async function processAllMissingImages(limit = 50) {
  console.log('=================================');
  console.log('Procesando Noticias Sin Imagen');
  console.log('=================================\n');
  
  try {
    // Obtener noticias sin imagen
    const { data: newsWithoutImages, error } = await supabase
      .from('news')
      .select('id, title, description, category')
      .or('image_url.is.null,image_url.eq.')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    if (!newsWithoutImages || newsWithoutImages.length === 0) {
      console.log('✅ Todas las noticias tienen imagen');
      return { 
        success: true, 
        message: 'No hay noticias sin imagen',
        processed: 0 
      };
    }
    
    console.log(`📰 Procesando ${newsWithoutImages.length} noticias sin imagen...\n`);
    
    const results = [];
    for (const news of newsWithoutImages) {
      const result = await processNewsImage(news);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${news.title.substring(0, 40)}... - Imagen de ${result.source}`);
      } else {
        console.log(`❌ ${news.title.substring(0, 40)}... - Error: ${result.error}`);
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Resultados:`);
    console.log(`   ✅ Exitosas: ${successful}`);
    console.log(`   ❌ Fallidas: ${failed}`);
    
    // Estadísticas por fuente
    const sourceStats = {};
    results.filter(r => r.success).forEach(r => {
      sourceStats[r.source] = (sourceStats[r.source] || 0) + 1;
    });
    
    console.log(`\n📈 Fuentes utilizadas:`);
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} imágenes`);
    });
    
    return {
      success: true,
      processed: successful,
      failed: failed,
      sourceStats: sourceStats
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Para uso como módulo
module.exports = {
  processAllMissingImages,
  processNewsImage,
  extractKeywords,
  searchUnsplashFree
};

// Para ejecución directa
if (require.main === module) {
  processAllMissingImages().then(result => {
    console.log('\n✅ Proceso completado:', result);
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}