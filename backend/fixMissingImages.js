require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getCategoryDefaultImage } = require('./services/imageService');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMissingImages() {
  console.log('=================================');
  console.log('Reparando Imágenes Faltantes');
  console.log('=================================\n');

  try {
    // Obtener todas las noticias sin imagen
    const { data: newsWithoutImages, error } = await supabase
      .from('news')
      .select('id, title, category')
      .or('image_url.is.null,image_url.eq.')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`📊 Encontradas ${newsWithoutImages.length} noticias sin imagen\n`);

    if (newsWithoutImages.length === 0) {
      console.log('✅ Todas las noticias tienen imagen!');
      return;
    }

    // Agrupar por categoría para mostrar progreso
    const byCategory = {};
    newsWithoutImages.forEach(news => {
      if (!byCategory[news.category]) {
        byCategory[news.category] = [];
      }
      byCategory[news.category].push(news);
    });

    console.log('📈 Distribución por categoría:');
    Object.entries(byCategory).forEach(([cat, items]) => {
      console.log(`   ${cat}: ${items.length} noticias`);
    });
    console.log('\n');

    // Procesar por lotes para no sobrecargar la base de datos
    const batchSize = 50;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const [category, newsItems] of Object.entries(byCategory)) {
      console.log(`\n🔧 Procesando categoría: ${category.toUpperCase()}`);
      
      for (let i = 0; i < newsItems.length; i += batchSize) {
        const batch = newsItems.slice(i, i + batchSize);
        const updates = [];

        for (const news of batch) {
          // Obtener imagen por defecto basada en la categoría y título
          const imageUrl = getCategoryDefaultImage(news.category, news.title);
          
          updates.push({
            id: news.id,
            image_url: imageUrl
          });
        }

        // Actualizar en batch
        try {
          for (const update of updates) {
            const { error: updateError } = await supabase
              .from('news')
              .update({ image_url: update.image_url })
              .eq('id', update.id);

            if (updateError) {
              console.error(`   ❌ Error actualizando ID ${update.id}:`, updateError.message);
              totalErrors++;
            } else {
              totalUpdated++;
            }
          }

          const progress = Math.round(((i + batch.length) / newsItems.length) * 100);
          console.log(`   ✅ Progreso: ${progress}% (${i + batch.length}/${newsItems.length})`);
        } catch (batchError) {
          console.error(`   ❌ Error en batch:`, batchError.message);
          totalErrors += batch.length;
        }
      }
    }

    console.log('\n\n=================================');
    console.log('📊 RESUMEN FINAL');
    console.log('=================================');
    console.log(`✅ Actualizadas: ${totalUpdated} noticias`);
    console.log(`❌ Errores: ${totalErrors} noticias`);
    console.log(`📈 Tasa de éxito: ${Math.round((totalUpdated / newsWithoutImages.length) * 100)}%`);

    // Verificar resultado final
    const { data: stillMissing, error: checkError } = await supabase
      .from('news')
      .select('id', { count: 'exact', head: true })
      .or('image_url.is.null,image_url.eq.');

    if (!checkError && stillMissing) {
      console.log(`\n📌 Noticias que aún necesitan imagen: ${stillMissing.length}`);
    }

    console.log('\n✅ Proceso completado!');
    console.log('💡 Las imágenes por defecto se han asignado basándose en la categoría.');
    console.log('   Las nuevas noticias automáticamente tendrán imágenes asignadas.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar el fix
fixMissingImages();