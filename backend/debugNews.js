require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function debugNews() {
  console.log('🔍 Diagnosticando base de datos de noticias...\n');

  try {
    // 1. Contar total de noticias
    const { count: totalCount, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`📊 Total de noticias en la BD: ${totalCount || 0}`);

    // 2. Obtener las 5 noticias más recientes
    const { data: latestNews, error: latestError } = await supabase
      .from('news')
      .select('id, title, pub_date, created_at, category')
      .order('created_at', { ascending: false })
      .limit(5);

    if (latestError) throw latestError;

    if (latestNews && latestNews.length > 0) {
      console.log('\n📰 Últimas 5 noticias (por fecha de creación):');
      latestNews.forEach((news, i) => {
        console.log(`\n${i + 1}. ${news.title.substring(0, 50)}...`);
        console.log(`   Categoría: ${news.category}`);
        console.log(`   Fecha publicación: ${new Date(news.pub_date).toLocaleString()}`);
        console.log(`   Insertada en BD: ${new Date(news.created_at).toLocaleString()}`);
      });
    } else {
      console.log('\n❌ No hay noticias en la base de datos');
    }

    // 3. Verificar si hay noticias de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayNews, count: todayCount } = await supabase
      .from('news')
      .select('*', { count: 'exact' })
      .gte('created_at', today.toISOString());

    console.log(`\n📅 Noticias insertadas hoy: ${todayCount || 0}`);

    // 4. Verificar distribución por categorías
    const { data: allNews } = await supabase
      .from('news')
      .select('category');

    if (allNews && allNews.length > 0) {
      const categoryStats = {};
      allNews.forEach(news => {
        categoryStats[news.category] = (categoryStats[news.category] || 0) + 1;
      });

      console.log('\n📊 Distribución por categorías:');
      Object.entries(categoryStats).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} noticias`);
      });
    }

    // 5. Probar inserción manual
    console.log('\n🧪 Probando inserción manual...');
    
    const testNews = {
      title: 'Noticia de prueba - ' + new Date().toISOString(),
      description: 'Esta es una noticia de prueba para verificar la inserción',
      link: 'https://test.com/news-' + Date.now(),
      pub_date: new Date().toISOString(),
      source: 'Test Source',
      category: 'ai',
      is_featured: false,
      severity: 'medium'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('news')
      .insert([testNews])
      .select();

    if (insertError) {
      console.log('❌ Error al insertar noticia de prueba:', insertError.message);
      console.log('   Detalles:', insertError);
    } else {
      console.log('✅ Noticia de prueba insertada correctamente');
      console.log('   ID:', insertResult[0].id);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar
debugNews();