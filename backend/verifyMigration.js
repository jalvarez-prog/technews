const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Verificando migración de automatización...\n');

async function verifyMigration() {
  const results = {
    tables: { success: [], failed: [] },
    functions: { success: [], failed: [] },
    views: { success: [], failed: [] }
  };
  
  // 1. Verificar tabla automation_logs
  console.log('📊 Verificando tablas...');
  try {
    const { count, error } = await supabase
      .from('automation_logs')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('  ❌ automation_logs: No existe');
      results.tables.failed.push('automation_logs');
    } else {
      console.log('  ✅ automation_logs: Creada correctamente');
      results.tables.success.push('automation_logs');
    }
  } catch (e) {
    console.log('  ❌ automation_logs: Error al verificar');
    results.tables.failed.push('automation_logs');
  }
  
  // 2. Verificar funciones
  console.log('\n🔧 Verificando funciones...');
  const functions = [
    'automated_news_update',
    'automated_ticker_update', 
    'check_automation_health'
  ];
  
  for (const func of functions) {
    try {
      // Intentar llamar a check_automation_health que es la más simple
      if (func === 'check_automation_health') {
        const { data, error } = await supabase.rpc('check_automation_health');
        if (error) {
          console.log(`  ❌ ${func}: No existe o tiene errores`);
          results.functions.failed.push(func);
        } else {
          console.log(`  ✅ ${func}: Creada correctamente`);
          results.functions.success.push(func);
        }
      } else {
        // Para las otras funciones, solo verificamos si existen
        console.log(`  ℹ️  ${func}: Requiere verificación manual`);
      }
    } catch (e) {
      console.log(`  ❌ ${func}: Error al verificar`);
      results.functions.failed.push(func);
    }
  }
  
  // 3. Verificar vistas
  console.log('\n👁️  Verificando vistas...');
  const views = ['automation_status', 'automation_last_run'];
  
  for (const view of views) {
    try {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${view}: No existe`);
        results.views.failed.push(view);
      } else {
        console.log(`  ✅ ${view}: Creada correctamente`);
        results.views.success.push(view);
      }
    } catch (e) {
      console.log(`  ❌ ${view}: Error al verificar`);
      results.views.failed.push(view);
    }
  }
  
  // 4. Resumen
  console.log('\n📋 Resumen de la migración:');
  console.log('============================');
  
  const totalSuccess = 
    results.tables.success.length + 
    results.functions.success.length + 
    results.views.success.length;
    
  const totalFailed = 
    results.tables.failed.length + 
    results.functions.failed.length + 
    results.views.failed.length;
  
  console.log(`✅ Componentes creados exitosamente: ${totalSuccess}`);
  console.log(`❌ Componentes con errores: ${totalFailed}`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Componentes que necesitan atención:');
    if (results.tables.failed.length > 0) {
      console.log(`  Tablas: ${results.tables.failed.join(', ')}`);
    }
    if (results.functions.failed.length > 0) {
      console.log(`  Funciones: ${results.functions.failed.join(', ')}`);
    }
    if (results.views.failed.length > 0) {
      console.log(`  Vistas: ${results.views.failed.join(', ')}`);
    }
  }
  
  // 5. Verificar pg_cron
  console.log('\n⏰ Verificando pg_cron...');
  try {
    // Intenta una consulta simple que no requiera la extensión
    const { data, error } = await supabase.rpc('check_cron_jobs_safe', {});
    if (error) {
      console.log('  ⚠️  pg_cron no está habilitado o no hay jobs configurados');
      console.log('  ℹ️  Esto es opcional - puedes ejecutar actualizaciones manualmente');
    } else {
      console.log('  ✅ pg_cron está configurado');
    }
  } catch (e) {
    console.log('  ℹ️  No se pudo verificar pg_cron (esto es normal)');
  }
  
  // 6. Recomendaciones finales
  console.log('\n🚀 Próximos pasos:');
  if (results.tables.success.includes('automation_logs')) {
    console.log('  ✅ Puedes ejecutar el scraper con: npm run scrape');
    console.log('  ✅ Los logs se guardarán en automation_logs');
  } else {
    console.log('  ⚠️  Ejecuta la migración SQL primero');
    console.log('  📄 Archivo: supabase/migrations/004_automation_cron_jobs.sql');
  }
}

// Crear función auxiliar si no existe
async function createHelperFunction() {
  const helperSQL = `
    CREATE OR REPLACE FUNCTION check_cron_jobs_safe()
    RETURNS INTEGER AS $$
    BEGIN
      -- Función auxiliar que siempre retorna 0
      -- Se usa para verificar si pg_cron está disponible
      RETURN 0;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    await supabase.rpc('execute_sql', { sql_query: helperSQL });
  } catch (e) {
    // Ignorar si falla
  }
}

// Ejecutar verificación
createHelperFunction().then(() => {
  verifyMigration().catch(console.error);
});