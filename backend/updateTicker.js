require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateTicker() {
  console.log('🔄 Actualizando ticker de noticias...\n');

  try {
    // 1. Obtener noticias recientes
    const { data: recentNews, error: fetchError } = await supabase
      .from('news')
      .select('*')
      .order('pub_date', { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;

    console.log(`📰 Se encontraron ${recentNews.length} noticias recientes`);

    // 2. Filtrar y seleccionar para el ticker
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000); // Buscar noticias de los últimos 7 días
    const categoryCount = {};
    const selectedNews = [];

    for (const news of recentNews) {
      const pubDate = new Date(news.pub_date);
      
      if (pubDate > weekAgo && selectedNews.length < 10) {
        const category = news.category;
        
        if (!categoryCount[category]) {
          categoryCount[category] = 0;
        }
        
        if (categoryCount[category] < 2) {
          const isImportant = ['critical', 'hot', 'high'].includes(news.severity);
          
          if (isImportant || selectedNews.length < 5) {
            selectedNews.push(news);
            categoryCount[category]++;
          }
        }
      }
    }

    console.log(`✅ ${selectedNews.length} noticias seleccionadas para el ticker`);

    // 3. Limpiar ticker anterior
    const { error: clearError } = await supabase
      .from('news')
      .update({ is_featured: false })
      .eq('is_featured', true);

    if (clearError) throw clearError;

    // 4. Actualizar nuevas noticias en el ticker
    for (const news of selectedNews) {
      const { error: updateError } = await supabase
        .from('news')
        .update({ is_featured: true })
        .eq('id', news.id);

      if (updateError) throw updateError;
    }

    console.log('\n✨ Ticker actualizado exitosamente!');
    console.log('\nDistribución por categoría:');
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} noticias`);
    });

  } catch (error) {
    console.error('❌ Error al actualizar ticker:', error.message);
  }
}

// Ejecutar
updateTicker();