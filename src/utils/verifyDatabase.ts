import { supabase } from '../lib/supabase';

export async function verifyDatabaseConnection() {
  console.log('🔍 Verificando conexión con Supabase...\n');
  
  try {
    // 1. Verificar conexión básica
    const { data: testConnection, error: connectionError } = await supabase
      .from('news')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return false;
    }
    
    console.log('✅ Conexión establecida con Supabase');
    
    // 2. Contar noticias totales
    const { count: totalNews } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total de noticias en la base de datos: ${totalNews}`);
    
    // 3. Verificar noticias por categoría
    const categories = ['cybersecurity', 'ai', 'cloud', 'quantum', 'finance-crypto'];
    console.log('\n📁 Noticias por categoría:');
    
    for (const category of categories) {
      const { data, count } = await supabase
        .from('news')
        .select('title', { count: 'exact' })
        .eq('category', category)
        .limit(1);
      
      if (data && data.length > 0) {
        console.log(`  • ${category}: ${count} noticias`);
        console.log(`    Ejemplo: "${data[0].title.substring(0, 50)}..."`);
      }
    }
    
    // 4. Verificar noticias destacadas (ticker)
    const { data: featured, count: featuredCount } = await supabase
      .from('news')
      .select('title, severity', { count: 'exact' })
      .eq('is_featured', true);
    
    console.log(`\n⭐ Noticias destacadas: ${featuredCount}`);
    if (featured && featured.length > 0) {
      featured.slice(0, 3).forEach(news => {
        console.log(`  • [${news.severity}] ${news.title.substring(0, 40)}...`);
      });
    }
    
    // 5. Verificar fecha de las noticias más recientes
    const { data: recentNews } = await supabase
      .from('news')
      .select('title, pub_date')
      .order('pub_date', { ascending: false })
      .limit(3);
    
    console.log('\n📅 Noticias más recientes:');
    if (recentNews) {
      recentNews.forEach(news => {
        const date = new Date(news.pub_date);
        const timeAgo = getTimeAgo(date);
        console.log(`  • "${news.title.substring(0, 40)}..." (${timeAgo})`);
      });
    }
    
    console.log('\n✅ VERIFICACIÓN COMPLETA: La base de datos está funcionando correctamente');
    console.log('🌐 URL del proyecto:', 'https://ynyaakoeygdualrqqusj.supabase.co');
    
    // Añadir al objeto window para poder usar desde la consola
    if (typeof window !== 'undefined') {
      (window as any).supabaseStats = {
        connected: true,
        totalNews,
        featuredCount,
        lastCheck: new Date().toISOString()
      };
      console.log('\n💡 TIP: Puedes acceder a window.supabaseStats para ver estadísticas actualizadas');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    return false;
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'hace momentos';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? 's' : ''}`;
}

// Exponer la función globalmente para la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).verifyDatabase = verifyDatabaseConnection;
}