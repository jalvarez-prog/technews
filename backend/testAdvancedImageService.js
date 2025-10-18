require('dotenv').config();
const advancedImageService = require('./services/advancedImageService');

async function testImageService() {
  console.log('=================================');
  console.log('Testing Servicio Avanzado de Imágenes');
  console.log('=================================\n');

  // Artículos de prueba simulados
  const testArticles = [
    {
      title: 'New AI Breakthrough: GPT-5 Announced with Unprecedented Capabilities',
      link: 'https://example.com/ai-breakthrough-1',
      contentSnippet: 'OpenAI announces GPT-5 with revolutionary capabilities...',
      category: 'ai'
    },
    {
      title: 'Critical Security Vulnerability Found in Major Cloud Provider',
      link: 'https://example.com/security-vuln-1',
      contentSnippet: 'Security researchers discovered critical vulnerability...',
      category: 'cybersecurity'
    },
    {
      title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
      link: 'https://example.com/bitcoin-ath-1',
      contentSnippet: 'Bitcoin price surges to new record as institutions...',
      category: 'finance-crypto'
    },
    {
      title: 'Quantum Computer Achieves 1000 Qubit Milestone',
      link: 'https://example.com/quantum-milestone-1',
      contentSnippet: 'IBM announces breakthrough in quantum computing...',
      category: 'quantum'
    },
    {
      title: 'Revolutionary IoT Sensor Network Transforms Smart Cities',
      link: 'https://example.com/iot-smart-cities-1',
      contentSnippet: 'New IoT sensor network enables unprecedented city monitoring...',
      category: 'iot'
    }
  ];

  console.log('🧪 Probando extracción de imágenes para 5 artículos de prueba:\n');

  const results = [];
  for (const article of testArticles) {
    console.log(`📰 Procesando: "${article.title.substring(0, 50)}..."`);
    console.log(`   Categoría: ${article.category}`);
    
    const startTime = Date.now();
    try {
      const imageUrl = await advancedImageService.getOptimalImage(article, article.category);
      const elapsed = Date.now() - startTime;
      
      console.log(`   ✅ Imagen obtenida en ${elapsed}ms`);
      console.log(`   URL: ${imageUrl.substring(0, 80)}...`);
      
      results.push({
        title: article.title,
        category: article.category,
        imageUrl: imageUrl,
        time: elapsed,
        success: true
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        title: article.title,
        category: article.category,
        error: error.message,
        success: false
      });
    }
    console.log();
  }

  // Probar detección de duplicados
  console.log('🔄 Probando prevención de duplicados:\n');
  
  const duplicateTest = testArticles[0];
  console.log(`Intentando obtener imagen para el mismo artículo nuevamente...`);
  
  const image1 = await advancedImageService.getOptimalImage(duplicateTest, duplicateTest.category);
  console.log(`Primera imagen: ${image1.substring(0, 60)}...`);
  
  // Limpiar caché de sesión para simular nueva sesión
  advancedImageService.usedImages.clear();
  
  const image2 = await advancedImageService.getOptimalImage(duplicateTest, duplicateTest.category);
  console.log(`Segunda imagen (desde caché): ${image2.substring(0, 60)}...`);
  
  if (image1 === image2) {
    console.log('✅ Caché funcionando correctamente - misma imagen devuelta');
  } else {
    console.log('⚠️  Las imágenes son diferentes (esperado si el caché de BD no está configurado)');
  }

  // Estadísticas
  console.log('\n\n📊 ESTADÍSTICAS DE LA PRUEBA:');
  console.log('================================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const avgTime = results.filter(r => r.success)
    .reduce((acc, r) => acc + r.time, 0) / successful;
  
  console.log(`✅ Exitosas: ${successful}/${results.length}`);
  console.log(`❌ Fallidas: ${failed}/${results.length}`);
  console.log(`⏱️  Tiempo promedio: ${Math.round(avgTime)}ms`);
  console.log(`📦 Imágenes en caché de sesión: ${advancedImageService.usedImages.size}`);

  // Mostrar estadísticas del servicio
  try {
    const stats = await advancedImageService.getStatistics();
    console.log(`\n📈 Estadísticas del servicio:`);
    console.log(`   Caché de sesión: ${stats.sessionCacheSize} imágenes`);
    console.log(`   Caché en BD: ${stats.databaseCacheSize} registros`);
  } catch (error) {
    console.log(`\n⚠️  No se pudieron obtener estadísticas de BD (tabla no existe aún)`);
  }

  console.log('\n💡 RECOMENDACIONES:');
  console.log('1. Ejecuta el SQL de migración en Supabase Dashboard');
  console.log('2. Configura API keys de Unsplash/Pexels en .env (opcional)');
  console.log('3. El sistema funciona sin APIs externas usando Picsum');
  console.log('4. Cada imagen generada es única y no se repite');
}

// Ejecutar prueba
testImageService().catch(console.error);