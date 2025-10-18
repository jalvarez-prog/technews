// Cargar variables de entorno
require('dotenv').config();

const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const advancedImageService = require('./advancedImageService');
const { fetchAndSanitizeFeed } = require('./feedSanitizer');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service key para operaciones de servidor
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parser RSS with enhanced error handling
const parser = new Parser({
  timeout: 30000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure']
  },
  // Add custom parser options to handle malformed XML
  requestOptions: {
    rejectUnauthorized: false
  }
});

// Configuración de feeds RSS
const rssFeedsConfig = {
  'cybersecurity': [
    'https://feeds.feedburner.com/TheHackersNews',
    'https://www.darkreading.com/rss.xml',
    'https://www.bleepingcomputer.com/feed/',
    'https://krebsonsecurity.com/feed/',
    'https://www.schneier.com/blog/atom.xml'
  ],
  'ai': [
    'https://www.artificialintelligence-news.com/feed/',
    'https://syncedreview.com/feed/',
    'https://venturebeat.com/ai/feed/',
    'https://www.marktechpost.com/feed/',
    'https://thegradient.pub/rss/'
  ],
  'finance-crypto': [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://bitcoinmagazine.com/feed',
    'https://decrypt.co/feed',
    'https://cryptonews.com/news/feed/'
  ],
  'software-devops': [
    'https://www.infoq.com/feed',
    'https://devops.com/feed/',
    'https://dzone.com/feeds/rss/all/',
    'https://sdtimes.com/feed/',
    'https://thenewstack.io/feed/'
  ],
  'iot': [
    'https://iot-analytics.com/feed/',
    'https://www.iotforall.com/feed',
    'https://www.iotworld.com/feed/',
    'https://www.iotworldtoday.com/feed/',
    'https://staceyoniot.com/feed/'
  ],
  'cloud': [
    'https://www.cloudcomputing-news.net/feed/',
    'https://aws.amazon.com/blogs/aws/feed/',
    'https://cloudplatform.googleblog.com/feeds/posts/default',
    'https://azure.microsoft.com/en-us/blog/feed/',
    'https://www.ibm.com/blogs/cloud-computing/feed/'
  ],
  'data-science': [
    'https://www.kdnuggets.com/feed',
    'https://towardsdatascience.com/feed',
    'https://www.datasciencecentral.com/feed/',
    'https://analyticsindiamag.com/feed/',
    'https://www.datacamp.com/community/rss.xml'
  ],
  'quantum': [
    'https://thequantuminsider.com/feed/',
    'https://quantumcomputingreport.com/feed/',
    'https://www.quantamagazine.org/feed/',
    'https://physicsworld.com/feed/',
    'https://www.nature.com/subjects/quantum-physics.rss'
  ]
};

/**
 * Extrae la URL de imagen del item RSS (función legacy - mantener para compatibilidad)
 * NOTA: Se recomienda usar getArticleImage del imageService para mejor cobertura
 */
function extractImageUrl(item) {
  // Intentar diferentes fuentes de imágenes
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.includes('image')) {
    return item.enclosure.url;
  }
  
  // Buscar imágenes en el contenido HTML
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return null;
}

/**
 * Determina la severidad basada en el título y contenido
 */
function calculateSeverity(title, description, category) {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = titleLower + ' ' + descLower;
  
  // Palabras clave para diferentes severidades
  const criticalKeywords = ['breach', 'hack', 'zero-day', 'critical', 'emergency', 'urgent', 'exploit'];
  const highKeywords = ['vulnerability', 'security', 'warning', 'alert', 'risk', 'threat'];
  const hotKeywords = ['breaking', 'just in', 'exclusive', 'announces', 'launches', 'releases'];
  const trendingKeywords = ['trending', 'viral', 'popular', 'surge', 'growth', 'adoption'];
  
  // Verificar palabras clave
  if (criticalKeywords.some(keyword => combined.includes(keyword))) {
    return 'critical';
  }
  if (highKeywords.some(keyword => combined.includes(keyword))) {
    return 'high';
  }
  if (hotKeywords.some(keyword => combined.includes(keyword))) {
    return 'hot';
  }
  if (trendingKeywords.some(keyword => combined.includes(keyword))) {
    return 'trending';
  }
  
  return 'medium';
}

/**
 * Determina si una noticia debe ser destacada
 */
function shouldBeFeatured(severity, pubDate) {
  // Destacar noticias críticas o de alta severidad de las últimas 24 horas
  const hoursSincePublished = (Date.now() - new Date(pubDate).getTime()) / (1000 * 60 * 60);
  
  if (severity === 'critical' && hoursSincePublished <= 48) {
    return true;
  }
  if (severity === 'high' && hoursSincePublished <= 24) {
    return true;
  }
  if ((severity === 'hot' || severity === 'trending') && hoursSincePublished <= 12) {
    return true;
  }
  
  return false;
}

/**
 * Genera tags basados en el título y descripción
 */
function generateTags(title, description, category, source) {
  const tags = [];
  const text = (title + ' ' + description).toLowerCase();
  
  // Tags específicos por categoría
  const categoryTags = {
    'cybersecurity': ['security', 'vulnerability', 'malware', 'ransomware', 'phishing', 'firewall', 'encryption'],
    'ai': ['machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision', 'gpt', 'llm'],
    'finance-crypto': ['bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'web3', 'trading'],
    'software-devops': ['kubernetes', 'docker', 'ci/cd', 'microservices', 'agile', 'cloud native', 'automation'],
    'iot': ['sensors', 'edge computing', 'smart home', 'industrial iot', 'mqtt', 'embedded', '5g'],
    'cloud': ['aws', 'azure', 'gcp', 'serverless', 'saas', 'paas', 'iaas', 'multi-cloud'],
    'data-science': ['analytics', 'big data', 'data mining', 'visualization', 'statistics', 'python', 'r'],
    'quantum': ['qubits', 'quantum computing', 'quantum algorithms', 'quantum supremacy', 'quantum cryptography']
  };
  
  // Agregar tag de categoría
  tags.push(category);
  
  // Agregar tag de fuente
  tags.push(source.toLowerCase().replace(/\s+/g, '-'));
  
  // Buscar tags relevantes en el texto
  if (categoryTags[category]) {
    categoryTags[category].forEach(tag => {
      if (text.includes(tag)) {
        tags.push(tag);
      }
    });
  }
  
  // Limitar a 5 tags
  return [...new Set(tags)].slice(0, 5);
}

/**
 * Procesa un feed RSS individual
 */
async function processFeed(feedUrl, category) {
  try {
    console.log(`Processing feed: ${feedUrl} for category: ${category}`);
    
    // Use the robust feed sanitizer to handle problematic feeds
    const feed = await fetchAndSanitizeFeed(feedUrl);
    
    // Check if the feed had errors but returned a structure
    if (feed.error) {
      console.warn(`Feed ${feedUrl} returned with errors: ${feed.errorMessage}`);
      // Continue processing with empty items to update feed status
    }
    const sourceName = feed.title || feedUrl;
    
    // Actualizar registro de feed
    await supabase
      .from('feed_updates')
      .upsert({
        feed_url: feedUrl,
        category: category,
        last_fetched: new Date().toISOString(),
        last_successful: new Date().toISOString(),
        error_count: 0,
        is_active: true
      }, {
        onConflict: 'feed_url'
      });
    
    // Procesar cada item del feed
    const newsItems = [];
    for (const item of feed.items.slice(0, 20)) { // Limitar a 20 items por feed
      try {
        const pubDate = new Date(item.pubDate || item.isoDate || Date.now());
        // Usar el servicio avanzado de imágenes con múltiples fuentes y sin repetición
        const imageUrl = await advancedImageService.getOptimalImage(item, category);
        const severity = calculateSeverity(item.title, item.contentSnippet, category);
        const isFeatured = shouldBeFeatured(severity, pubDate);
        const tags = generateTags(item.title, item.contentSnippet, category, sourceName);
        
        const newsItem = {
          title: item.title.substring(0, 500),
          description: (item.contentSnippet || item.content || '').substring(0, 1000),
          link: item.link,
          pub_date: pubDate.toISOString(),
          source: sourceName.substring(0, 255),
          category: category,
          image_url: imageUrl,
          content: item.content,
          is_featured: isFeatured,
          severity: severity,
          tags: tags
        };
        
        newsItems.push(newsItem);
      } catch (itemError) {
        console.error(`Error processing item from ${feedUrl}:`, itemError);
      }
    }
    
    // Insertar noticias en batch con manejo de duplicados
    if (newsItems.length > 0) {
      let insertedCount = 0;
      let updatedCount = 0;
      
      // Procesar cada noticia individualmente para manejar duplicados
      for (const newsItem of newsItems) {
        try {
          // Primero verificar si el link ya existe
          const { data: existing } = await supabase
            .from('news')
            .select('id, severity, is_featured')
            .eq('link', newsItem.link)
            .single();
          
          if (existing) {
            // Si existe, actualizar solo si es necesario
            const updates = {};
            let shouldUpdate = false;
            
            // Actualizar severidad si la nueva es más alta
            if (newsItem.severity === 'critical' && existing.severity !== 'critical') {
              updates.severity = 'critical';
              shouldUpdate = true;
            }
            
            // Actualizar is_featured si la nueva debe ser destacada
            if (newsItem.is_featured && !existing.is_featured) {
              updates.is_featured = true;
              shouldUpdate = true;
            }
            
            if (shouldUpdate) {
              await supabase
                .from('news')
                .update(updates)
                .eq('id', existing.id);
              updatedCount++;
            }
          } else {
            // Si no existe, insertar
            const { error: insertError } = await supabase
              .from('news')
              .insert([newsItem]);
              
            if (!insertError) {
              insertedCount++;
            } else if (!insertError.message.includes('duplicate key value')) {
              // Solo registrar errores que no sean de duplicados
              console.error(`Error inserting news item:`, insertError);
            }
          }
        } catch (itemError) {
          console.error(`Error processing news item:`, itemError);
        }
      }
      
      console.log(`Feed ${feedUrl}: ${insertedCount} inserted, ${updatedCount} updated`);
    }
    
    return { success: true, count: newsItems.length };
    
  } catch (error) {
    console.error(`Error processing feed ${feedUrl}:`, error);
    
    // Primero obtener el error count actual
    const { data: existingFeed } = await supabase
      .from('feed_updates')
      .select('error_count')
      .eq('feed_url', feedUrl)
      .single();
    
    const currentErrorCount = existingFeed?.error_count || 0;
    
    // Actualizar error en feed_updates
    await supabase
      .from('feed_updates')
      .upsert({
        feed_url: feedUrl,
        category: category,
        last_fetched: new Date().toISOString(),
        last_error: error.message,
        error_count: currentErrorCount + 1,
        is_active: true
      }, {
        onConflict: 'feed_url'
      });
    
    return { success: false, error: error.message };
  }
}

/**
 * Procesa todos los feeds de una categoría
 */
async function processCategory(category, feeds) {
  console.log(`\nProcessing category: ${category} with ${feeds.length} feeds`);
  
  const results = {
    category: category,
    totalFeeds: feeds.length,
    successfulFeeds: 0,
    totalNews: 0,
    errors: []
  };
  
  // Procesar feeds en paralelo con límite
  const batchSize = 3;
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(feedUrl => processFeed(feedUrl, category))
    );
    
    batchResults.forEach((result, index) => {
      if (result.success) {
        results.successfulFeeds++;
        results.totalNews += result.count;
      } else {
        results.errors.push({
          feed: batch[index],
          error: result.error
        });
      }
    });
  }
  
  return results;
}

/**
 * Actualiza las noticias destacadas del ticker
 */
async function updateTickerFeatures() {
  console.log('\nUpdating ticker featured news...');
  
  try {
    // Para cada categoría, destacar las noticias más recientes e importantes
    for (const category of Object.keys(rssFeedsConfig)) {
      // Obtener las últimas noticias de alta severidad
      const { data: recentNews } = await supabase
        .from('news')
        .select('id, severity, pub_date')
        .eq('category', category)
        .in('severity', ['critical', 'high', 'hot', 'trending'])
        .gte('pub_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('pub_date', { ascending: false })
        .limit(6);
      
      if (recentNews && recentNews.length > 0) {
        // Marcar como destacadas
        const ids = recentNews.map(n => n.id);
        await supabase
          .from('news')
          .update({ is_featured: true })
          .in('id', ids);
        
        console.log(`Featured ${ids.length} news for category ${category}`);
      }
    }
    
    // Quitar destacado de noticias antiguas
    await supabase
      .from('news')
      .update({ is_featured: false })
      .eq('is_featured', true)
      .lt('pub_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    return { success: true };
    
  } catch (error) {
    console.error('Error updating ticker features:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función principal para procesar todos los feeds
 */
async function scrapeAllFeeds() {
  console.log('Starting RSS scraping process...');
  console.log(`Total categories: ${Object.keys(rssFeedsConfig).length}`);
  console.log(`Total feeds: ${Object.values(rssFeedsConfig).flat().length}`);
  
  const startTime = Date.now();
  const results = {
    startTime: new Date().toISOString(),
    categories: {},
    totalNews: 0,
    totalErrors: 0,
    duration: 0
  };
  
  try {
    // Procesar cada categoría
    for (const [category, feeds] of Object.entries(rssFeedsConfig)) {
      const categoryResult = await processCategory(category, feeds);
      results.categories[category] = categoryResult;
      results.totalNews += categoryResult.totalNews;
      results.totalErrors += categoryResult.errors.length;
    }
    
    // Actualizar noticias destacadas para el ticker
    const tickerResult = await updateTickerFeatures();
    results.tickerUpdate = tickerResult;
    
    // Ejecutar limpieza de noticias antiguas
    await supabase.rpc('cleanup_old_news');
    
    results.duration = (Date.now() - startTime) / 1000; // en segundos
    results.endTime = new Date().toISOString();
    results.success = true;
    
    console.log('\n=== Scraping completed successfully ===');
    console.log(`Total news scraped: ${results.totalNews}`);
    console.log(`Total errors: ${results.totalErrors}`);
    console.log(`Duration: ${results.duration}s`);
    
  } catch (error) {
    console.error('Fatal error during scraping:', error);
    results.success = false;
    results.error = error.message;
  }
  
  return results;
}

// Exportar funciones
module.exports = {
  scrapeAllFeeds,
  processCategory,
  processFeed,
  updateTickerFeatures
};

// Si se ejecuta directamente
if (require.main === module) {
  // Cargar variables de entorno si está en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  scrapeAllFeeds()
    .then(results => {
      console.log('\nFinal results:', JSON.stringify(results, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}