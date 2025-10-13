const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL no está configurada');
  process.exit(1);
}

// Usar anon key si no hay service key disponible
const supabase = createClient(
  supabaseUrl, 
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWFha29leWdkdWFscnFxdXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDczNjksImV4cCI6MjA3NTQ4MzM2OX0.4L7yV2RwCl8ZsqNlPPr3KMCnOkVAj9xV60kRE4OZUng'
);

console.log('🔍 Verificando estado de Supabase...\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Service Key: ${supabaseKey ? '✅ Configurada' : '❌ No configurada (usando anon key)'}\n`);

async function checkDatabase() {
  try {
    // Verificar tablas existentes
    console.log('📊 Verificando tablas...');
    const tables = ['news', 'ticker_stats', 'feed_updates', 'cleanup_logs', 'api_rate_limits', 'automation_logs'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact' });
      if (error && error.code === '42P01') {
        console.log(`  ❌ ${table}: No existe`);
      } else if (error) {
        console.log(`  ⚠️  ${table}: Error - ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: Existe`);
      }
    }
    
    // Verificar si hay noticias
    console.log('\n📰 Estado de las noticias:');
    const { count: totalNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    const { count: featuredNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true);
    
    console.log(`  Total de noticias: ${totalNews || 0}`);
    console.log(`  Noticias destacadas: ${featuredNews || 0}`);
    
    // Verificar categorías
    if (totalNews > 0) {
      const { data: categories } = await supabase
        .from('news')
        .select('category')
        .limit(1000);
      
      const categoryCounts = categories?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📁 Noticias por categoría:');
      Object.entries(categoryCounts || {}).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
    }
    
    // Verificar si pg_cron está habilitado
    console.log('\n⏰ Verificando automatización:');
    const { data: cronJobs, error: cronError } = await supabase
      .rpc('check_cron_jobs', {});
    
    if (cronError) {
      console.log('  ❌ pg_cron no está disponible o no hay jobs configurados');
    } else {
      console.log(`  ✅ Cron jobs configurados: ${cronJobs?.length || 0}`);
    }
    
    // Verificar automation_logs si existe
    const { data: lastAutomation } = await supabase
      .from('automation_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (lastAutomation) {
      console.log(`\n🤖 Última automatización:`);
      console.log(`  Workflow: ${lastAutomation.workflow}`);
      console.log(`  Estado: ${lastAutomation.status}`);
      console.log(`  Fecha: ${new Date(lastAutomation.started_at).toLocaleString()}`);
    }
    
    console.log('\n✅ Verificación completa!');
    
  } catch (error) {
    console.error('\n❌ Error al verificar la base de datos:', error.message);
  }
}

// Función RPC personalizada para verificar cron jobs
async function checkCronRPC() {
  try {
    await supabase.rpc('create_check_cron_function', {
      function_definition: `
        CREATE OR REPLACE FUNCTION check_cron_jobs()
        RETURNS TABLE (jobid bigint, schedule text, command text)
        LANGUAGE sql
        AS $$
          SELECT jobid, schedule, command 
          FROM cron.job 
          WHERE jobname LIKE 'automated-%';
        $$;
      `
    });
  } catch (e) {
    // La función puede no existir, lo cual está bien
  }
}

checkDatabase();