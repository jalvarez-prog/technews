require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkLatestNews() {
  console.log('Verificando las últimas noticias en la base de datos...\n');
  
  // Obtener las últimas 10 noticias
  const { data: news, error } = await supabase
    .from('news')
    .select('id, title, category, created_at, source')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (news && news.length > 0) {
    console.log(`Últimas ${news.length} noticias:\n`);
    news.forEach((item, index) => {
      console.log(`${index + 1}. [${item.category}] ${item.title}`);
      console.log(`   Fuente: ${item.source}`);
      console.log(`   Creado: ${new Date(item.created_at).toLocaleString()}\n`);
    });

    // Contar noticias por categoría
    const { data: counts } = await supabase
      .from('news')
      .select('category')
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());

    if (counts) {
      const categoryCounts = counts.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      console.log('Noticias de las últimas 24 horas por categoría:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }
  } else {
    console.log('No se encontraron noticias en la base de datos.');
  }
}

checkLatestNews();