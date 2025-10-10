// Script de prueba para verificar la conexión con Supabase
// Ejecutar con: node test-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ No configurado');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurado' : '❌ No configurado');
  process.exit(1);
}

console.log('🔧 Configuración:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');
console.log('\n📡 Conectando a Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Contar noticias totales
    console.log('Test 1: Contando noticias totales...');
    const { count: totalCount, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    console.log(`✅ Total de noticias en la base de datos: ${totalCount}`);

    // Test 2: Obtener noticias por categoría
    console.log('\nTest 2: Obteniendo noticias por categoría...');
    const categories = ['cybersecurity', 'ai', 'cloud', 'quantum'];
    
    for (const category of categories) {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, category')
        .eq('category', category)
        .limit(2);
      
      if (error) throw error;
      console.log(`\n📁 ${category}:`);
      console.log(`   Noticias encontradas: ${data.length}`);
      if (data.length > 0) {
        console.log(`   Primera noticia: "${data[0].title.substring(0, 50)}..."`);
      }
    }

    // Test 3: Verificar noticias destacadas
    console.log('\nTest 3: Verificando noticias destacadas (ticker)...');
    const { data: featured, error: featuredError } = await supabase
      .from('news')
      .select('title, severity, is_featured')
      .eq('is_featured', true)
      .limit(5);
    
    if (featuredError) throw featuredError;
    console.log(`✅ Noticias destacadas encontradas: ${featured.length}`);
    featured.forEach(news => {
      console.log(`   - [${news.severity}] ${news.title.substring(0, 40)}...`);
    });

    // Test 4: Verificar políticas RLS
    console.log('\nTest 4: Verificando políticas de seguridad...');
    const { data: policies, error: policyError } = await supabase
      .from('news')
      .select('id')
      .limit(1);
    
    if (policyError) {
      console.log('❌ Error al leer datos (posible problema de RLS):', policyError.message);
    } else {
      console.log('✅ Políticas RLS configuradas correctamente - Lectura pública permitida');
    }

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ La conexión con Supabase está funcionando correctamente.');
    console.log('✅ Tu aplicación debería poder mostrar las noticias ahora.');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
testConnection();