// Cargar variables de entorno
require('dotenv').config();

const cron = require('node-cron');
const { scrapeAllFeeds } = require('./rssScraperService');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Registra la ejecución de un cron job
 */
async function logCronExecution(jobName, status, details = {}) {
  try {
    await supabase
      .from('cron_logs')
      .insert({
        job_name: jobName,
        execution_time: new Date().toISOString(),
        status: status,
        duration_ms: details.duration || 0,
        items_processed: details.items_processed || 0,
        error_message: details.error || null
      });
  } catch (error) {
    console.error('Error logging cron execution:', error);
  }
}

/**
 * Job para scraping de RSS principal
 * Se ejecuta cada 30 minutos
 */
const rssScrapingJob = cron.schedule('*/30 * * * *', async () => {
  console.log('\n[CRON] Starting RSS scraping job at', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    const results = await scrapeAllFeeds();
    const duration = Date.now() - startTime;
    
    await logCronExecution('rss_scraping', 'success', {
      duration: duration,
      items_processed: results.totalNews || 0
    });
    
    console.log('[CRON] RSS scraping job completed successfully');
  } catch (error) {
    console.error('[CRON] RSS scraping job failed:', error);
    await logCronExecution('rss_scraping', 'error', {
      duration: Date.now() - startTime,
      error: error.message
    });
  }
}, {
  scheduled: false,
  timezone: 'America/Mexico_City'
});

/**
 * Job para limpieza de noticias antiguas
 * Se ejecuta diariamente a las 3:00 AM
 */
const cleanupJob = cron.schedule('0 3 * * *', async () => {
  console.log('\n[CRON] Starting cleanup job at', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // Eliminar noticias de más de 30 días
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('news')
      .delete()
      .lt('pub_date', thirtyDaysAgo)
      .select('id');
    
    if (error) throw error;
    
    const deletedCount = data ? data.length : 0;
    console.log(`[CRON] Deleted ${deletedCount} old news items`);
    
    await logCronExecution('cleanup_old_news', 'success', {
      duration: Date.now() - startTime,
      items_processed: deletedCount
    });
    
  } catch (error) {
    console.error('[CRON] Cleanup job failed:', error);
    await logCronExecution('cleanup_old_news', 'error', {
      duration: Date.now() - startTime,
      error: error.message
    });
  }
}, {
  scheduled: false,
  timezone: 'America/Mexico_City'
});

/**
 * Job para actualización rápida de fuentes críticas
 * Se ejecuta cada 10 minutos para categorías importantes
 */
const quickUpdateJob = cron.schedule('*/10 * * * *', async () => {
  console.log('\n[CRON] Starting quick update job at', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // Solo actualizar categorías críticas
    const criticalCategories = ['cybersecurity', 'ai', 'finance-crypto'];
    
    // Importar funciones necesarias
    const { processCategory } = require('./rssScraperService');
    const rssFeedsConfig = {
      'cybersecurity': [
        'https://feeds.feedburner.com/TheHackersNews',
        'https://www.darkreading.com/rss.xml'
      ],
      'ai': [
        'https://www.artificialintelligence-news.com/feed/',
        'https://syncedreview.com/feed/'
      ],
      'finance-crypto': [
        'https://cointelegraph.com/rss',
        'https://www.coindesk.com/arc/outboundfeeds/rss/'
      ]
    };
    
    let totalNews = 0;
    
    for (const category of criticalCategories) {
      if (rssFeedsConfig[category]) {
        const results = await processCategory(category, rssFeedsConfig[category]);
        totalNews += results.totalNews;
      }
    }
    
    await logCronExecution('quick_update', 'success', {
      duration: Date.now() - startTime,
      items_processed: totalNews
    });
    
    console.log('[CRON] Quick update job completed successfully');
  } catch (error) {
    console.error('[CRON] Quick update job failed:', error);
    await logCronExecution('quick_update', 'error', {
      duration: Date.now() - startTime,
      error: error.message
    });
  }
}, {
  scheduled: false,
  timezone: 'America/Mexico_City'
});

/**
 * Job para actualizar estadísticas
 * Se ejecuta cada hora
 */
const statsUpdateJob = cron.schedule('0 * * * *', async () => {
  console.log('\n[CRON] Starting stats update job at', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // Actualizar estadísticas por categoría
    const categories = ['cybersecurity', 'ai', 'finance-crypto', 'software-devops', 
                       'iot', 'cloud', 'data-science', 'quantum'];
    
    for (const category of categories) {
      // Contar noticias de las últimas 24 horas
      const { count: dailyCount } = await supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('category', category)
        .gte('pub_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      // Contar total de noticias
      const { count: totalCount } = await supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('category', category);
      
      // Actualizar o insertar estadísticas
      await supabase
        .from('category_stats')
        .upsert({
          category: category,
          daily_count: dailyCount || 0,
          total_count: totalCount || 0,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'category'
        });
    }
    
    await logCronExecution('stats_update', 'success', {
      duration: Date.now() - startTime
    });
    
    console.log('[CRON] Stats update job completed successfully');
  } catch (error) {
    console.error('[CRON] Stats update job failed:', error);
    await logCronExecution('stats_update', 'error', {
      duration: Date.now() - startTime,
      error: error.message
    });
  }
}, {
  scheduled: false,
  timezone: 'America/Mexico_City'
});

/**
 * Inicia todos los cron jobs
 */
function startAllJobs() {
  console.log('Starting all cron jobs...');
  
  rssScrapingJob.start();
  console.log('✓ RSS scraping job scheduled (every 30 minutes)');
  
  cleanupJob.start();
  console.log('✓ Cleanup job scheduled (daily at 3:00 AM)');
  
  quickUpdateJob.start();
  console.log('✓ Quick update job scheduled (every 10 minutes)');
  
  statsUpdateJob.start();
  console.log('✓ Stats update job scheduled (every hour)');
  
  console.log('\nAll cron jobs are now running.');
}

/**
 * Detiene todos los cron jobs
 */
function stopAllJobs() {
  console.log('Stopping all cron jobs...');
  
  rssScrapingJob.stop();
  cleanupJob.stop();
  quickUpdateJob.stop();
  statsUpdateJob.stop();
  
  console.log('All cron jobs stopped.');
}

/**
 * Ejecuta un job específico manualmente
 */
async function runJobManually(jobName) {
  switch(jobName) {
    case 'rss':
      await rssScrapingJob._callbacks[0]();
      break;
    case 'cleanup':
      await cleanupJob._callbacks[0]();
      break;
    case 'quick':
      await quickUpdateJob._callbacks[0]();
      break;
    case 'stats':
      await statsUpdateJob._callbacks[0]();
      break;
    default:
      console.error('Unknown job name:', jobName);
  }
}

module.exports = {
  startAllJobs,
  stopAllJobs,
  runJobManually,
  rssScrapingJob,
  cleanupJob,
  quickUpdateJob,
  statsUpdateJob
};