const axios = require('axios');
const cheerio = require('cheerio');

// Imágenes por defecto para cada categoría
const DEFAULT_CATEGORY_IMAGES = {
  'cybersecurity': [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', // Cybersecurity
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80', // Security shield
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80', // Code security
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', // Matrix code
    'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80'  // Padlock
  ],
  'ai': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80', // AI brain
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', // AI concept
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80', // Neural network
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80', // AI robot
    'https://images.unsplash.com/photo-1596348158863-a8c90b8ab588?w=800&q=80'  // Machine learning
  ],
  'finance-crypto': [
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80', // Bitcoin
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80', // Ethereum
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80', // Crypto coins
    'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80', // Trading charts
    'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80'  // Crypto network
  ],
  'software-devops': [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', // Coding
    'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&q=80', // Programming
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80', // DevOps pipeline
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', // Code on laptop
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&q=80'  // Programming setup
  ],
  'iot': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', // IoT devices
    'https://images.unsplash.com/photo-1544725121-be34353f8ca1?w=800&q=80', // Smart home
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', // Circuit board
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80', // Connected devices
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80'  // Technology
  ],
  'cloud': [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80', // Cloud computing
    'https://images.unsplash.com/photo-1667984390527-850f63192709?w=800&q=80', // Data center
    'https://images.unsplash.com/photo-1565728744382-61accd86e44f?w=800&q=80', // Server room
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // Cloud sky
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'  // Data center lights
  ],
  'data-science': [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', // Data charts
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', // Analytics
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&q=80', // Data visualization
    'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80', // Statistics
    'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80'  // Dashboard
  ],
  'quantum': [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', // Quantum computer
    'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=800&q=80', // Quantum physics
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // Abstract quantum
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // Quantum particles
    'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80'  // Quantum technology
  ]
};

// Cache de imágenes para evitar repetición excesiva
const imageCache = new Map();

/**
 * Valida si una URL de imagen es válida
 */
async function validateImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Validar formato de URL
  try {
    new URL(url);
  } catch {
    return false;
  }
  
  // Verificar si la imagen es accesible (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    try {
      const response = await axios.head(url, { 
        timeout: 3000,
        validateStatus: (status) => status === 200
      });
      const contentType = response.headers['content-type'];
      return contentType && contentType.startsWith('image/');
    } catch {
      return false;
    }
  }
  
  return true;
}

/**
 * Extrae imágenes del contenido HTML
 */
function extractImagesFromHTML(html) {
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const images = [];
  
  // Buscar todas las imágenes en el HTML
  $('img').each((_, elem) => {
    const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
    if (src) {
      // Filtrar imágenes pequeñas (probablemente iconos)
      const width = parseInt($(elem).attr('width')) || 0;
      const height = parseInt($(elem).attr('height')) || 0;
      
      if (width < 50 || height < 50) return;
      
      images.push(src);
    }
  });
  
  // Buscar imágenes en meta tags
  $('meta[property="og:image"]').each((_, elem) => {
    const content = $(elem).attr('content');
    if (content) images.push(content);
  });
  
  return images;
}

/**
 * Intenta obtener una imagen del artículo completo
 */
async function fetchImageFromArticle(articleUrl) {
  try {
    const response = await axios.get(articleUrl, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const images = extractImagesFromHTML(response.data);
    
    // Validar y retornar la primera imagen válida
    for (const imageUrl of images) {
      if (await validateImageUrl(imageUrl)) {
        return imageUrl;
      }
    }
  } catch (error) {
    console.error('Error fetching article for image:', error.message);
  }
  
  return null;
}

/**
 * Genera una URL de imagen usando un servicio de placeholder
 */
function generatePlaceholderImage(title, category) {
  // Usar Picsum para imágenes aleatorias con un seed basado en el título
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/800/400`;
}

/**
 * Obtiene una imagen por defecto basada en la categoría
 */
function getCategoryDefaultImage(category, title) {
  const categoryImages = DEFAULT_CATEGORY_IMAGES[category] || DEFAULT_CATEGORY_IMAGES['cloud'];
  
  // Usar un hash del título para seleccionar consistentemente una imagen
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % categoryImages.length;
  
  return categoryImages[index];
}

/**
 * Sistema principal para obtener imagen con múltiples fallbacks
 */
async function getArticleImage(item, category) {
  const cacheKey = `${category}_${item.link}`;
  
  // Verificar cache
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  let imageUrl = null;
  
  // 1. Intentar obtener imagen del feed RSS (mejorado)
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    imageUrl = item['media:content']['$'].url;
  } else if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    imageUrl = item['media:thumbnail']['$'].url;
  } else if (item['media:thumbnail'] && typeof item['media:thumbnail'] === 'string') {
    imageUrl = item['media:thumbnail'];
  } else if (item.enclosure && item.enclosure.url) {
    if (item.enclosure.type && item.enclosure.type.includes('image')) {
      imageUrl = item.enclosure.url;
    }
  } else if (item.image) {
    imageUrl = typeof item.image === 'object' ? item.image.url : item.image;
  }
  
  // 2. Si no hay imagen del RSS, buscar en el contenido
  if (!imageUrl && item.content) {
    const contentImages = extractImagesFromHTML(item.content);
    if (contentImages.length > 0) {
      imageUrl = contentImages[0];
    }
  }
  
  // 3. Si no hay imagen del contenido, buscar en la descripción
  if (!imageUrl && item.contentSnippet) {
    const descImages = extractImagesFromHTML(item.contentSnippet);
    if (descImages.length > 0) {
      imageUrl = descImages[0];
    }
  }
  
  // 4. Validar la imagen encontrada
  if (imageUrl && await validateImageUrl(imageUrl)) {
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  }
  
  // 5. Si no hay imagen válida, intentar obtener del artículo completo
  if (item.link && process.env.FETCH_ARTICLE_IMAGES === 'true') {
    imageUrl = await fetchImageFromArticle(item.link);
    if (imageUrl) {
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
  }
  
  // 6. Usar imagen por defecto de la categoría
  imageUrl = getCategoryDefaultImage(category, item.title);
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
}

/**
 * Limpia el cache de imágenes (llamar periódicamente)
 */
function clearImageCache() {
  imageCache.clear();
}

module.exports = {
  getArticleImage,
  validateImageUrl,
  extractImagesFromHTML,
  getCategoryDefaultImage,
  clearImageCache
};