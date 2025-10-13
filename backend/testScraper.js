const { scrapeAllFeeds } = require('./services/rssScraperService.js');
require('dotenv').config();

// Verificar configuración
console.log('🔧 Configuración del Scraper');
console.log('===========================');
console.log(`Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`Service Key: ${process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_SERVICE_KEY !== 'your-service-role-key-here' ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`\n`);

// Ejecutar scraper
console.log('🚀 Iniciando prueba del scraper...');
console.log('Nota: Este proceso puede tomar varios minutos.\n');

scrapeAllFeeds()
  .then(results => {
    console.log('\n✅ Scraping completado!');
    console.log('========================');
    console.log(`Total de noticias: ${results.totalNews}`);
    console.log(`Errores encontrados: ${results.totalErrors}`);
    console.log(`Duración: ${results.duration}s`);
    
    // Mostrar resumen por categoría
    console.log('\n📊 Resumen por categoría:');
    Object.entries(results.categories).forEach(([category, data]) => {
      console.log(`  ${category}: ${data.totalNews} noticias (${data.successfulFeeds}/${data.totalFeeds} feeds exitosos)`);
    });
    
    if (results.totalErrors > 0) {
      console.log('\n⚠️ Nota: Algunos feeds no pudieron ser procesados.');
      console.log('Esto es normal ya que algunos sitios pueden estar temporalmente inaccesibles.');
    }
  })
  .catch(error => {
    console.error('\n❌ Error al ejecutar el scraper:', error);
    console.error('\nPosibles causas:');
    console.error('1. Verifica que el Service Key esté correctamente configurado');
    console.error('2. Verifica tu conexión a internet');
    console.error('3. Algunos feeds RSS pueden estar temporalmente inaccesibles');
  });