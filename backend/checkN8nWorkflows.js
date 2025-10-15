require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWorkflowStatus() {
  console.log('=================================');
  console.log('Verificando Workflows de n8n');
  console.log('=================================\n');

  try {
    // 1. Verificar noticias recientes (últimas 2 horas)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: recentNews, error: newsError } = await supabase
      .from('news')
      .select('id, title, category, created_at, source')
      .gte('created_at', twoHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5);

    if (newsError) throw newsError;

    console.log('📰 Noticias insertadas en las últimas 2 horas:');
    if (recentNews && recentNews.length > 0) {
      console.log(`✅ Se encontraron ${recentNews.length} noticias nuevas`);
      recentNews.forEach(news => {
        console.log(`   - [${news.category}] ${news.title.substring(0, 60)}...`);
        console.log(`     Fuente: ${news.source} | Hora: ${new Date(news.created_at).toLocaleString()}`);
      });
    } else {
      console.log('❌ No se encontraron noticias nuevas en las últimas 2 horas');
      console.log('   Esto podría indicar que el workflow de RSS no está funcionando');
    }

    console.log('\n---------------------------------\n');

    // 2. Verificar estado del ticker
    const { data: tickerNews, error: tickerError } = await supabase
      .from('news')
      .select('id, title, category, is_featured, severity, updated_at')
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (tickerError) throw tickerError;

    console.log('📊 Estado del Ticker:');
    if (tickerNews && tickerNews.length > 0) {
      console.log(`✅ ${tickerNews.length} noticias activas en el ticker`);
      
      // Verificar última actualización
      const lastUpdate = new Date(tickerNews[0].updated_at);
      const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
      
      console.log(`   Última actualización: ${lastUpdate.toLocaleString()}`);
      console.log(`   Hace ${hoursSinceUpdate.toFixed(1)} horas`);
      
      if (hoursSinceUpdate > 4) {
        console.log('   ⚠️  El ticker no se ha actualizado en más de 4 horas');
      }
      
      // Mostrar distribución por categoría
      const categoryCount = {};
      tickerNews.forEach(news => {
        categoryCount[news.category] = (categoryCount[news.category] || 0) + 1;
      });
      
      console.log('\n   Distribución por categoría:');
      Object.entries(categoryCount).forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count} noticias`);
      });
    } else {
      console.log('❌ No hay noticias en el ticker');
      console.log('   El workflow de actualización del ticker podría no estar funcionando');
    }

    console.log('\n---------------------------------\n');

    // 3. Verificar todas las categorías
    const { data: categoryStats } = await supabase
      .from('news')
      .select('category')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (categoryStats) {
      const stats = {};
      categoryStats.forEach(row => {
        stats[row.category] = (stats[row.category] || 0) + 1;
      });

      console.log('📈 Noticias por categoría (últimas 24h):');
      Object.entries(stats).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} noticias`);
      });
    }

    console.log('\n---------------------------------\n');

    // 4. Recomendaciones
    console.log('💡 Recomendaciones:');
    console.log('1. Si no hay noticias recientes:');
    console.log('   - Verifica que los workflows estén activos en n8n');
    console.log('   - Revisa los logs de ejecución en n8n (Executions)');
    console.log('   - Confirma que las credenciales de Supabase estén correctas');
    console.log('\n2. Si el ticker no se actualiza:');
    console.log('   - Ejecuta manualmente el workflow "Ticker Update"');
    console.log('   - Verifica que haya noticias de las últimas 24h');
    console.log('\n3. Para forzar una ejecución manual:');
    console.log('   - Abre el workflow en n8n');
    console.log('   - Click en "Execute Workflow"');

  } catch (error) {
    console.error('❌ Error al verificar workflows:', error.message);
  }
}

// Ejecutar verificación
checkWorkflowStatus();