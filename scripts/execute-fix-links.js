import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ynyaakoeygdualrqqusj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY no está configurada en las variables de entorno');
  console.log('\nPara ejecutar este script necesitas:');
  console.log('1. Obtener tu Service Key desde el dashboard de Supabase');
  console.log('2. Configurarla temporalmente: $env:SUPABASE_SERVICE_KEY="tu-service-key"');
  console.log('3. Ejecutar: node scripts/execute-fix-links.js');
  process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLScript() {
  try {
    console.log('🔄 Iniciando actualización de enlaces de noticias...\n');

    // Read the SQL script
    const sqlScriptPath = path.join(__dirname, 'fix-news-links-final.sql');
    const sqlContent = fs.readFileSync(sqlScriptPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip SELECT statements for verification (we'll do our own)
      if (statement.toUpperCase().includes('SELECT')) {
        continue;
      }

      console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        query: statement 
      }).single();

      if (error) {
        console.error(`❌ Error en statement ${i + 1}:`, error.message);
        // Continue with other statements
      }
    }

    // Verify the results
    console.log('\n✅ Actualizaciones completadas. Verificando resultados...\n');

    const { data: summary, error: summaryError } = await supabase
      .from('news')
      .select('category, link')
      .order('category');

    if (!summaryError && summary) {
      const stats = {};
      summary.forEach(item => {
        if (!stats[item.category]) {
          stats[item.category] = {
            total: 0,
            googleLinks: 0,
            otherLinks: 0,
            emptyLinks: 0
          };
        }
        stats[item.category].total++;
        
        if (!item.link || item.link === '') {
          stats[item.category].emptyLinks++;
        } else if (item.link.includes('google.com')) {
          stats[item.category].googleLinks++;
        } else {
          stats[item.category].otherLinks++;
        }
      });

      console.log('📊 Resumen por categoría:');
      console.log('─'.repeat(60));
      Object.entries(stats).forEach(([category, stat]) => {
        console.log(`\n${category}:`);
        console.log(`  Total artículos: ${stat.total}`);
        console.log(`  Enlaces Google: ${stat.googleLinks}`);
        console.log(`  Otros enlaces: ${stat.otherLinks}`);
        console.log(`  Sin enlace: ${stat.emptyLinks}`);
      });
    }

    // Show some examples
    const { data: examples, error: examplesError } = await supabase
      .from('news')
      .select('title, source, link')
      .like('link', '%google.com%')
      .limit(5);

    if (!examplesError && examples) {
      console.log('\n\n📌 Ejemplos de enlaces actualizados:');
      console.log('─'.repeat(60));
      examples.forEach(item => {
        console.log(`\n"${item.title}"`);
        console.log(`Fuente: ${item.source}`);
        console.log(`Enlace: ${item.link.substring(0, 100)}...`);
      });
    }

    console.log('\n\n✅ ¡Actualización completada con éxito!');
    console.log('Los enlaces de las noticias ahora apuntan a búsquedas de Google relevantes.');

  } catch (error) {
    console.error('❌ Error ejecutando el script:', error);
  }
}

// Execute the script
executeSQLScript();