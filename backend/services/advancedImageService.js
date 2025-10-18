require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Servicio Avanzado de Gestión de Imágenes
 * - Múltiples fuentes de imágenes
 * - Caché inteligente para evitar repetición
 * - Validación robusta
 * - Fallbacks múltiples
 */

class AdvancedImageService {
  constructor() {
    // APIs de imágenes (necesitarás registrarte para obtener las keys)
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || 'demo';
    this.pexelsApiKey = process.env.PEXELS_API_KEY || 'demo';
    
    // Caché en memoria para sesión actual
    this.sessionCache = new Map();
    this.usedImages = new Set();
    
    // Palabras clave por categoría para búsqueda de imágenes
    this.categoryKeywords = {
      'cybersecurity': ['cybersecurity', 'hacking', 'data protection', 'network security', 'cyber attack', 'encryption', 'firewall', 'malware'],
      'ai': ['artificial intelligence', 'machine learning', 'neural network', 'deep learning', 'AI technology', 'robotics', 'automation', 'algorithm'],
      'finance-crypto': ['cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'trading', 'digital currency', 'defi', 'crypto market'],
      'software-devops': ['programming', 'coding', 'software development', 'devops', 'cloud computing', 'kubernetes', 'docker', 'agile'],
      'iot': ['internet of things', 'smart devices', 'connected devices', 'sensors', 'smart home', 'industrial iot', 'embedded systems'],
      'cloud': ['cloud computing', 'data center', 'server room', 'cloud storage', 'aws', 'azure', 'cloud technology', 'saas'],
      'data-science': ['data science', 'analytics', 'big data', 'data visualization', 'statistics', 'data analysis', 'machine learning', 'dashboard'],
      'quantum': ['quantum computing', 'quantum physics', 'quantum processor', 'quantum technology', 'qubits', 'quantum mechanics', 'quantum computer']
    };
  }

  /**
   * Genera un hash único para el artículo
   */
  generateArticleHash(title, link) {
    return crypto.createHash('md5').update(`${title}${link}`).digest('hex');
  }

  /**
   * Busca en el caché de la base de datos
   */
  async checkDatabaseCache(articleHash) {
    try {
      const { data } = await supabase
        .from('image_cache')
        .select('image_url, last_validated')
        .eq('article_hash', articleHash)
        .single();
      
      if (data && data.image_url) {
        // Verificar si la imagen sigue siendo válida (cada 30 días)
        const lastValidated = new Date(data.last_validated);
        const daysSinceValidation = (Date.now() - lastValidated) / (1000 * 60 * 60 * 24);
        
        if (daysSinceValidation < 30) {
          return data.image_url;
        }
      }
    } catch (error) {
      // No hay caché, continuar
    }
    return null;
  }

  /**
   * Guarda en el caché de la base de datos
   */
  async saveToDatabaseCache(articleHash, imageUrl, source) {
    try {
      await supabase
        .from('image_cache')
        .upsert({
          article_hash: articleHash,
          image_url: imageUrl,
          source: source,
          last_validated: new Date().toISOString(),
          usage_count: 1
        }, {
          onConflict: 'article_hash'
        });
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Busca imágenes en Unsplash
   */
  async searchUnsplash(query, category) {
    if (this.unsplashAccessKey === 'demo') return null;
    
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          per_page: 30,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        },
        timeout: 5000
      });

      if (response.data.results && response.data.results.length > 0) {
        // Filtrar imágenes ya usadas y seleccionar una aleatoria
        const availableImages = response.data.results.filter(
          img => !this.usedImages.has(img.urls.regular)
        );
        
        if (availableImages.length > 0) {
          const selected = availableImages[Math.floor(Math.random() * availableImages.length)];
          this.usedImages.add(selected.urls.regular);
          return selected.urls.regular;
        }
      }
    } catch (error) {
      console.error('Unsplash search error:', error.message);
    }
    return null;
  }

  /**
   * Busca imágenes en Pexels
   */
  async searchPexels(query, category) {
    if (this.pexelsApiKey === 'demo') return null;
    
    try {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: query,
          per_page: 30,
          orientation: 'landscape'
        },
        headers: {
          'Authorization': this.pexelsApiKey
        },
        timeout: 5000
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const availableImages = response.data.photos.filter(
          img => !this.usedImages.has(img.src.large)
        );
        
        if (availableImages.length > 0) {
          const selected = availableImages[Math.floor(Math.random() * availableImages.length)];
          this.usedImages.add(selected.src.large);
          return selected.src.large;
        }
      }
    } catch (error) {
      console.error('Pexels search error:', error.message);
    }
    return null;
  }

  /**
   * Extrae imágenes del artículo con técnicas avanzadas
   */
  async extractFromArticle(articleUrl) {
    // Validate articleUrl is a string and valid URL
    if (!articleUrl || typeof articleUrl !== 'string') {
      return null;
    }
    
    // Check if it's a valid URL
    if (!articleUrl.startsWith('http://') && !articleUrl.startsWith('https://')) {
      return null;
    }
    
    try {
      const response = await axios.get(articleUrl, {
        timeout: 7000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const images = [];

      // 1. Open Graph image (prioridad alta)
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) images.push({ url: ogImage, priority: 10 });

      // 2. Twitter Card image
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      if (twitterImage && twitterImage !== ogImage) {
        images.push({ url: twitterImage, priority: 9 });
      }

      // 3. Schema.org image
      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const json = JSON.parse($(elem).text());
          if (json.image) {
            const imageUrl = Array.isArray(json.image) ? json.image[0] : json.image;
            images.push({ url: imageUrl, priority: 8 });
          }
        } catch {}
      });

      // 4. Article images (hero image, featured image)
      $('article img, .article-hero img, .featured-image img, .post-thumbnail img').each((_, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        const width = parseInt($(elem).attr('width')) || 0;
        const height = parseInt($(elem).attr('height')) || 0;
        
        if (src && (width > 300 || height > 200 || (width === 0 && height === 0))) {
          images.push({ url: src, priority: 7 });
        }
      });

      // 5. Imágenes en el contenido principal
      $('.content img, .entry-content img, main img').each((_, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        if (src && !images.some(img => img.url === src)) {
          images.push({ url: src, priority: 5 });
        }
      });

      // Ordenar por prioridad y validar URLs
      images.sort((a, b) => b.priority - a.priority);
      
      for (const img of images) {
        const fullUrl = this.resolveUrl(img.url, articleUrl);
        if (await this.validateImageUrl(fullUrl)) {
          return fullUrl;
        }
      }
    } catch (error) {
      console.error('Article extraction error:', error.message);
    }
    return null;
  }

  /**
   * Resuelve URLs relativas a absolutas
   */
  resolveUrl(url, baseUrl) {
    // Ensure url is a string
    if (!url || typeof url !== 'string') return null;
    
    // Ensure baseUrl is a string
    if (!baseUrl || typeof baseUrl !== 'string') return null;
    
    // Check if already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    try {
      const base = new URL(baseUrl);
      if (url.startsWith('//')) {
        return `${base.protocol}${url}`;
      }
      if (url.startsWith('/')) {
        return `${base.origin}${url}`;
      }
      return new URL(url, baseUrl).href;
    } catch {
      return null;
    }
  }

  /**
   * Valida que una URL de imagen sea accesible y válida
   */
  async validateImageUrl(url) {
    // Ensure url is a string and valid URL format
    if (!url || typeof url !== 'string') return false;
    
    // Check if already used
    if (this.usedImages.has(url)) return false;
    
    // Check for valid URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    try {
      const response = await axios.head(url, {
        timeout: 3000,
        maxRedirects: 2,
        validateStatus: (status) => status >= 200 && status < 400
      });
      
      const contentType = response.headers['content-type'];
      const contentLength = parseInt(response.headers['content-length']) || 0;
      
      // Verificar tipo y tamaño
      return contentType && 
             contentType.startsWith('image/') && 
             contentLength > 5000; // Mínimo 5KB
    } catch {
      return false;
    }
  }

  /**
   * Genera palabras clave inteligentes basadas en el título
   */
  extractKeywordsFromTitle(title, category) {
    const words = title.toLowerCase().split(/\s+/);
    const keywords = [];
    
    // Palabras importantes del título (más de 4 caracteres, no stopwords)
    const stopwords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'which', 'when', 'where', 'what', 'how'];
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 4 && !stopwords.includes(cleaned)) {
        keywords.push(cleaned);
      }
    });
    
    // Agregar palabras clave de la categoría
    if (this.categoryKeywords[category]) {
      keywords.push(...this.categoryKeywords[category].slice(0, 2));
    }
    
    return keywords.slice(0, 5).join(' ');
  }

  /**
   * Genera una imagen única usando Picsum con parámetros avanzados
   */
  generateUniqueStockImage(title, category) {
    // Generar seed único basado en título y timestamp
    const seed = crypto.createHash('md5')
      .update(`${title}${Date.now()}${Math.random()}`)
      .digest('hex')
      .substring(0, 10);
    
    // Variar dimensiones ligeramente para más variedad
    const width = 800 + Math.floor(Math.random() * 200);
    const height = 400 + Math.floor(Math.random() * 100);
    
    // Aplicar filtros según categoría
    const filters = {
      'cybersecurity': 'grayscale&blur=1',
      'ai': 'grayscale',
      'quantum': 'blur=2',
      'finance-crypto': '',
      'cloud': '',
      'data-science': '',
      'software-devops': '',
      'iot': ''
    };
    
    const filter = filters[category] || '';
    const url = `https://picsum.photos/seed/${seed}/${width}/${height}${filter ? '?' + filter : ''}`;
    
    this.usedImages.add(url);
    return url;
  }

  /**
   * Método principal para obtener imagen con múltiples estrategias
   */
  async getOptimalImage(item, category) {
    const articleHash = this.generateArticleHash(item.title, item.link);
    
    // 1. Verificar caché en base de datos
    const cachedImage = await this.checkDatabaseCache(articleHash);
    if (cachedImage && !this.usedImages.has(cachedImage)) {
      this.usedImages.add(cachedImage);
      return cachedImage;
    }
    
    let imageUrl = null;
    let source = null;
    
    // 2. Intentar extraer del feed RSS (mejorado)
    if (!imageUrl && item) {
      imageUrl = this.extractFromRSSItem(item);
      if (imageUrl && await this.validateImageUrl(imageUrl)) {
        source = 'rss_feed';
      } else {
        imageUrl = null;
      }
    }
    
    // 3. Extraer del artículo completo
    if (!imageUrl && item.link) {
      imageUrl = await this.extractFromArticle(item.link);
      if (imageUrl) {
        source = 'article_extraction';
      }
    }
    
    // 4. Buscar en APIs de imágenes con palabras clave
    if (!imageUrl) {
      const keywords = this.extractKeywordsFromTitle(item.title, category);
      
      // Intentar Unsplash
      imageUrl = await this.searchUnsplash(keywords, category);
      if (imageUrl) {
        source = 'unsplash';
      }
      
      // Intentar Pexels si Unsplash falla
      if (!imageUrl) {
        imageUrl = await this.searchPexels(keywords, category);
        if (imageUrl) {
          source = 'pexels';
        }
      }
    }
    
    // 5. Generar imagen única como último recurso
    if (!imageUrl) {
      imageUrl = this.generateUniqueStockImage(item.title, category);
      source = 'generated';
    }
    
    // Guardar en caché
    if (imageUrl) {
      await this.saveToDatabaseCache(articleHash, imageUrl, source);
      this.usedImages.add(imageUrl);
    }
    
    return imageUrl;
  }

  /**
   * Extrae imagen del item RSS con soporte extendido
   */
  extractFromRSSItem(item) {
    // Media RSS
    if (item['media:content']) {
      if (item['media:content']['$'] && item['media:content']['$'].url) {
        return item['media:content']['$'].url;
      }
      if (Array.isArray(item['media:content'])) {
        for (const media of item['media:content']) {
          if (media['$'] && media['$'].url) {
            return media['$'].url;
          }
        }
      }
    }
    
    // Media thumbnail
    if (item['media:thumbnail']) {
      if (typeof item['media:thumbnail'] === 'string') {
        return item['media:thumbnail'];
      }
      if (item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
        return item['media:thumbnail']['$'].url;
      }
    }
    
    // Enclosure
    if (item.enclosure && item.enclosure.url) {
      if (!item.enclosure.type || item.enclosure.type.includes('image')) {
        return item.enclosure.url;
      }
    }
    
    // Image field directo
    if (item.image) {
      return typeof item.image === 'object' ? item.image.url : item.image;
    }
    
    // Buscar en content/description HTML
    if (item.content || item.contentSnippet) {
      const html = item.content || item.contentSnippet;
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        return imgMatch[1];
      }
    }
    
    return null;
  }

  /**
   * Limpia el caché de sesión periódicamente
   */
  clearSessionCache() {
    if (this.usedImages.size > 1000) {
      // Mantener solo las últimas 500 imágenes
      const images = Array.from(this.usedImages);
      this.usedImages = new Set(images.slice(-500));
    }
  }

  /**
   * Obtiene estadísticas del servicio
   */
  async getStatistics() {
    const { data: cacheStats } = await supabase
      .from('image_cache')
      .select('source', { count: 'exact' });
    
    return {
      sessionCacheSize: this.usedImages.size,
      databaseCacheSize: cacheStats?.length || 0,
      sourcesDistribution: cacheStats
    };
  }
}

module.exports = new AdvancedImageService();