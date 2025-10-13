const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your-service-role-key-here') {
  console.error('❌ Error: Configura SUPABASE_URL y SUPABASE_SERVICE_KEY en el archivo .env');
  console.error('   El Service Key debe ser el real, no el placeholder');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Ejecutando migración de automatización...\n');
  
  try {
    // Leer el archivo SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_automation_cron_jobs.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Archivo de migración encontrado');
    console.log(`   Path: ${migrationPath}`);
    console.log(`   Tamaño: ${sqlContent.length} caracteres\n`);
    
    // Dividir el SQL en comandos individuales
    // Esto es necesario porque Supabase no siempre maneja bien múltiples comandos
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📊 Total de comandos SQL a ejecutar: ${sqlCommands.length}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Ejecutar cada comando
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i] + ';';
      const commandPreview = command.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        console.log(`⏳ Ejecutando comando ${i + 1}/${sqlCommands.length}: ${commandPreview}...`);
        
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_query: command
        }).single();
        
        if (error) {
          // Intentar ejecutar directamente si RPC falla
          const { error: directError } = await supabase.from('_sql').select(command);
          
          if (directError) {
            console.log(`   ❌ Error: ${directError.message}`);
            errorCount++;
          } else {
            console.log(`   ✅ Éxito`);
            successCount++;
          }
        } else {
          console.log(`   ✅ Éxito`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumen de la migración:');
    console.log(`   ✅ Comandos exitosos: ${successCount}`);
    console.log(`   ❌ Comandos con error: ${errorCount}`);
    
    // Verificar tablas creadas
    console.log('\n🔍 Verificando tablas creadas:');
    const tablesToCheck = ['automation_logs'];
    
    for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`   ❌ ${table}: No se pudo crear`);
      } else {
        console.log(`   ✅ ${table}: Creada correctamente`);
      }
    }
    
    console.log('\n⚠️  Nota importante:');
    console.log('   La migración incluye configuración de pg_cron que requiere:');
    console.log('   1. Habilitar la extensión pg_cron en Supabase Dashboard');
    console.log('   2. Los cron jobs se ejecutan en el servidor de Supabase');
    console.log('   3. Para desarrollo local, usa npm run scrape manualmente');
    
    console.log('\n✅ Proceso de migración completado!');
    console.log('   Próximo paso: Ejecuta "npm run scrape" para probar el scraper');
    
  } catch (error) {
    console.error('\n❌ Error fatal durante la migración:', error.message);
    process.exit(1);
  }
}

// Alternativa: Mostrar el SQL para ejecución manual
async function showSQLForManualExecution() {
  console.log('\n📋 Alternativa: Ejecuta este SQL manualmente en Supabase SQL Editor:');
  console.log('   1. Ve a: https://supabase.com/dashboard/project/ynyaakoeygdualrqqusj/sql/new');
  console.log('   2. Copia y pega el contenido del archivo:');
  console.log('      supabase/migrations/004_automation_cron_jobs.sql');
  console.log('   3. Ejecuta el script completo');
}

// Ejecutar migración
console.log('🔧 Sistema de Automatización de TechHub News');
console.log('============================================\n');

runMigration().then(() => {
  showSQLForManualExecution();
}).catch(console.error);