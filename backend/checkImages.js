require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkImages() {
  console.log('=================================');
  console.log('Verificando Imágenes en Noticias');
  console.log('=================================\n');

  try {
    // Obtener todas las noticias
    const { data: allNews, error } = await supabase
      .from('news')
      .select('id, title, category, image_url, source, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Estadísticas por categoría
    const stats = {};
    const missingImages = [];

    allNews.forEach(news => {
      if (!stats[news.category]) {
        stats[news.category] = {
          total: 0,
          withImage: 0,
          sources: {}
        };
      }
      
      stats[news.category].total++;
      
      if (!stats[news.category].sources[news.source]) {
        stats[news.category].sources[news.source] = {
          total: 0,
          withImage: 0
        };
      }
      
      stats[news.category].sources[news.source].total++;
      
      if (news.image_url && news.image_url !== '') {
        stats[news.category].withImage++;
        stats[news.category].sources[news.source].withImage++;
      } else {
        missingImages.push({
          id: news.id,
          title: news.title.substring(0, 50),
          category: news.category,
          source: news.source
        });
      }
    });

    // Mostrar estadísticas generales
    console.log('📊 Estadísticas de Imágenes por Categoría:');
    console.log('-------------------------------------------');
    
    Object.entries(stats).forEach(([category, stat]) => {
      const percentage = Math.round((stat.withImage / stat.total) * 100);
      const status = percentage > 80 ? '✅' : percentage > 50 ? '⚠️' : '❌';
      
      console.log(`\n${status} ${category.toUpperCase()}`);
      console.log(`   Total: ${stat.total} noticias`);
      console.log(`   Con imagen: ${stat.withImage} (${percentage}%)`);
      console.log(`   Sin imagen: ${stat.total - stat.withImage}`);
      
      // Mostrar fuentes problemáticas
      console.log(`   Fuentes:`);
      Object.entries(stat.sources).forEach(([source, sourceStats]) => {
        const sourcePercentage = Math.round((sourceStats.withImage / sourceStats.total) * 100);
        if (sourcePercentage < 50) {
          console.log(`     ⚠️  ${source}: ${sourceStats.withImage}/${sourceStats.total} (${sourcePercentage}%)`);
        } else {
          console.log(`     ✅ ${source}: ${sourceStats.withImage}/${sourceStats.total} (${sourcePercentage}%)`);
        }
      });
    });

    // Mostrar noticias recientes sin imagen
    console.log('\n\n📰 Últimas 10 Noticias Sin Imagen:');
    console.log('-----------------------------------');
    missingImages.slice(0, 10).forEach(news => {
      console.log(`- [${news.category}] ${news.title}...`);
      console.log(`  Fuente: ${news.source} | ID: ${news.id}`);
    });

    // Resumen general
    const totalNews = allNews.length;
    const totalWithImages = Object.values(stats).reduce((sum, s) => sum + s.withImage, 0);
    const overallPercentage = Math.round((totalWithImages / totalNews) * 100);
    
    console.log('\n\n📈 RESUMEN GENERAL:');
    console.log('===================');
    console.log(`Total de noticias: ${totalNews}`);
    console.log(`Con imagen: ${totalWithImages} (${overallPercentage}%)`);
    console.log(`Sin imagen: ${totalNews - totalWithImages}`);
    
    if (overallPercentage < 70) {
      console.log('\n⚠️  ATENCIÓN: Menos del 70% de las noticias tienen imagen');
      console.log('Posibles soluciones:');
      console.log('1. Revisar el scraper RSS para extraer imágenes');
      console.log('2. Implementar fallback con imágenes por defecto por categoría');
      console.log('3. Usar API de búsqueda de imágenes (Unsplash, Pexels)');
      console.log('4. Revisar los feeds RSS que no proveen imágenes');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkImages();