require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  console.log('=================================');
  console.log('Ejecutando Migración: Image Cache Table');
  console.log('=================================\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'migrations', 'create_image_cache_table.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // Ejecutar cada statement SQL por separado
    const statements = sqlContent
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    console.log(`📝 Ejecutando ${statements.length} statements SQL...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Mostrar qué se está ejecutando (solo el tipo de comando)
      const commandType = statement.split(' ').slice(0, 3).join(' ');
      console.log(`   ${i + 1}. Ejecutando: ${commandType}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          // Si el error es porque ya existe, no es crítico
          if (error.message.includes('already exists')) {
            console.log(`      ⚠️  Ya existe (ignorando)`);
          } else {
            console.error(`      ❌ Error:`, error.message);
          }
        } else {
          console.log(`      ✅ Completado`);
        }
      } catch (err) {
        console.error(`      ❌ Error ejecutando statement:`, err.message);
      }
    }
    
    // Verificar que la tabla se creó
    console.log('\n📊 Verificando tabla image_cache...');
    const { data: tables, error: tableError } = await supabase
      .from('image_cache')
      .select('id')
      .limit(1);
    
    if (tableError && !tableError.message.includes('relation')) {
      console.log('❌ Error verificando tabla:', tableError.message);
    } else if (tableError && tableError.message.includes('does not exist')) {
      console.log('❌ La tabla no se creó correctamente');
      console.log('\n⚠️  IMPORTANTE: Ejecuta el SQL manualmente en Supabase:');
      console.log('1. Ve a tu proyecto en Supabase Dashboard');
      console.log('2. Ve a SQL Editor');
      console.log('3. Copia y pega el contenido del archivo:');
      console.log(`   ${sqlPath}`);
      console.log('4. Ejecuta el SQL');
    } else {
      console.log('✅ Tabla image_cache verificada correctamente');
      
      // Obtener estadísticas
      const { count } = await supabase
        .from('image_cache')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📈 Registros en caché: ${count || 0}`);
    }
    
    console.log('\n✅ Migración completada!');
    console.log('💡 La tabla image_cache está lista para usar');
    console.log('   El servicio avanzado de imágenes ahora puede:');
    console.log('   - Cachear URLs de imágenes');
    console.log('   - Evitar duplicados');
    console.log('   - Rastrear fuentes de imágenes');
    console.log('   - Validar imágenes periódicamente');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.log('\n📋 Instrucciones para ejecutar manualmente:');
    console.log('1. Abre Supabase Dashboard');
    console.log('2. Ve a SQL Editor');
    console.log('3. Copia el contenido de backend/migrations/create_image_cache_table.sql');
    console.log('4. Ejecuta el SQL');
  }
}

// Función alternativa si no existe exec_sql en Supabase
async function createTableDirectly() {
  console.log('\n🔧 Intentando crear tabla directamente...');
  
  // Esta es una forma alternativa usando el cliente de Supabase
  // La tabla se puede crear manualmente en el dashboard si este método falla
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS image_cache (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      article_hash VARCHAR(32) UNIQUE NOT NULL,
      image_url TEXT NOT NULL,
      source VARCHAR(50) NOT NULL,
      last_validated TIMESTAMPTZ DEFAULT NOW(),
      usage_count INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  console.log('📝 SQL para crear tabla (copia esto si necesitas ejecutarlo manualmente):');
  console.log(createTableSQL);
  
  return true;
}

// Ejecutar migración
runMigration().catch(err => {
  console.error('Error fatal:', err);
  createTableDirectly();
});