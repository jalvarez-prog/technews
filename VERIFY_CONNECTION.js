// ===========================================
// VERIFICACIÓN DE CONEXIÓN CON SUPABASE
// ===========================================
// Copia y pega este código en la consola del navegador
// mientras tu aplicación está abierta en http://localhost:5173

(async function checkSupabase() {
  console.clear();
  console.log('%c🔍 VERIFICANDO CONEXIÓN CON SUPABASE...', 'color: #0ea5e9; font-size: 16px; font-weight: bold');
  console.log('=====================================\n');
  
  // Verificar si existe el cliente de Supabase
  const hasSupabase = window.localStorage.getItem('sb-ynyaakoeygdualrqqusj-auth-token');
  
  // Verificar SessionStorage para datos cacheados
  const categories = ['cybersecurity', 'ai', 'cloud', 'quantum', 'software-devops', 'iot', 'data-science', 'finance-crypto'];
  let foundData = false;
  let totalNewsInCache = 0;
  
  console.log('📦 VERIFICANDO CACHÉ LOCAL:');
  console.log('---------------------------');
  
  categories.forEach(category => {
    const cacheKey = `news-${category}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const news = JSON.parse(cachedData);
        if (news && news.length > 0) {
          foundData = true;
          totalNewsInCache += news.length;
          console.log(`✅ ${category}: ${news.length} noticias en caché`);
          
          // Verificar si las noticias tienen campos de Supabase
          if (news[0].id && news[0].pubDate) {
            // Verificar el formato del ID (UUID de Supabase)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(news[0].id);
            if (isUUID) {
              console.log(`   └─ 🎯 Datos de SUPABASE (ID: ${news[0].id.substring(0, 8)}...)`);
            } else {
              console.log(`   └─ 📝 Datos MOCK (ID: ${news[0].id})`);
            }
          }
        }
      } catch (e) {
        // Ignorar errores de parseo
      }
    }
  });
  
  if (!foundData) {
    console.log('⚠️ No hay datos en el caché. Refresca la página.');
  } else {
    console.log(`\n📊 Total en caché: ${totalNewsInCache} noticias`);
  }
  
  // Verificar peticiones de red
  console.log('\n🌐 ESTADO DE LA CONEXIÓN:');
  console.log('------------------------');
  
  // Verificar si hay el indicador visual
  const dbStatusElement = document.querySelector('[class*="Supabase Conectado"]');
  const hasGreenIndicator = document.querySelector('[class*="bg-green"]');
  
  if (hasGreenIndicator) {
    console.log('✅ Indicador visual muestra conexión activa');
  }
  
  // Resultado final
  console.log('\n📋 RESULTADO FINAL:');
  console.log('==================');
  
  if (foundData && totalNewsInCache > 0) {
    // Verificar si son datos de Supabase basándose en el ID
    const sampleData = sessionStorage.getItem('news-cybersecurity');
    if (sampleData) {
      const parsed = JSON.parse(sampleData);
      const isFromSupabase = parsed[0] && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed[0].id);
      
      if (isFromSupabase) {
        console.log('%c✅ ¡CONFIRMADO! Estás usando datos de SUPABASE', 'color: #10b981; font-size: 14px; font-weight: bold');
        console.log(`✅ Base de datos: ynyaakoeygdualrqqusj.supabase.co`);
        console.log(`✅ Total de noticias cargadas: ${totalNewsInCache}`);
        console.log(`✅ Categorías activas: ${categories.filter(c => sessionStorage.getItem(`news-${c}`)).length}/8`);
        
        // Mostrar una muestra de datos
        console.log('\n📰 Muestra de datos:');
        if (parsed[0]) {
          console.log('Título:', parsed[0].title);
          console.log('ID (Supabase):', parsed[0].id);
          console.log('Fuente:', parsed[0].source);
        }
      } else {
        console.log('%c⚠️ Estás usando datos MOCK (respaldo local)', 'color: #f59e0b; font-size: 14px; font-weight: bold');
        console.log('Los datos mock se usan cuando:');
        console.log('- Hay un error de conexión');
        console.log('- Las credenciales no son correctas');
        console.log('- Hay un problema con CORS');
      }
    }
  } else {
    console.log('%c❌ No se detectaron datos', 'color: #ef4444; font-size: 14px; font-weight: bold');
    console.log('Intenta:');
    console.log('1. Refrescar la página (F5)');
    console.log('2. Verificar que el servidor está corriendo (npm run dev)');
    console.log('3. Revisar la consola para errores');
  }
  
  console.log('\n💡 TIP: Mira el indicador en la esquina inferior derecha de la página');
  console.log('=====================================');
})();