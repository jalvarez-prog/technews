import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ynyaakoeygdualrqqusj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWFha29leWdkdWFscnFxdXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDczNjksImV4cCI6MjA3NTQ4MzM2OX0.4L7yV2RwCl8ZsqNlPPr3KMCnOkVAj9xV60kRE4OZUng';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateNewsLinks() {
  console.log('🔄 Actualizando enlaces de noticias...\n');

  try {
    // Step 1: Get all news with empty or example.com links
    console.log('📋 Obteniendo noticias con enlaces de prueba...');
    const { data: newsToUpdate, error: fetchError } = await supabase
      .from('news')
      .select('id, title, source, link')
      .or('link.eq.,link.like.%example.com%,link.is.null');

    if (fetchError) {
      console.error('❌ Error al obtener noticias:', fetchError);
      return;
    }

    console.log(`✅ Encontradas ${newsToUpdate.length} noticias para actualizar\n`);

    // Step 2: Update each news item with a Google search link
    console.log('🔄 Actualizando enlaces...');
    let updated = 0;
    let errors = 0;

    for (const news of newsToUpdate) {
      // Create Google search URL
      const searchQuery = `${news.title} ${news.source}`.toLowerCase()
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/,/g, '')
        .replace(/ /g, '+');
      
      const newLink = `https://www.google.com/search?q=${searchQuery}&btnI=1`;

      // Update the link
      const { error: updateError } = await supabase
        .from('news')
        .update({ link: newLink })
        .eq('id', news.id);

      if (updateError) {
        errors++;
        console.error(`❌ Error actualizando noticia ${news.id}:`, updateError.message);
      } else {
        updated++;
        if (updated % 10 === 0) {
          console.log(`  ✓ ${updated} noticias actualizadas...`);
        }
      }
    }

    console.log(`\n✅ Actualización completada: ${updated} enlaces actualizados, ${errors} errores\n`);

    // Step 3: Add site-specific search for known sources
    console.log('🔄 Mejorando enlaces con búsquedas específicas por sitio...');
    
    const siteMap = {
      'The Hacker News': 'thehackernews.com',
      'Dark Reading': 'darkreading.com',
      'Bleeping Computer': 'bleepingcomputer.com',
      'CoinTelegraph': 'cointelegraph.com',
      'CoinDesk': 'coindesk.com',
      'AI News': 'artificialintelligence-news.com',
      'VentureBeat': 'venturebeat.com',
      'InfoQ': 'infoq.com',
      'DevOps.com': 'devops.com',
      'KDnuggets': 'kdnuggets.com',
      'IoT Analytics': 'iot-analytics.com',
      'The Quantum Insider': 'thequantuminsider.com',
      'Cloud Computing News': 'cloudcomputing-news.net'
    };

    for (const [source, site] of Object.entries(siteMap)) {
      const { data: newsFromSource, error: sourceError } = await supabase
        .from('news')
        .select('id, title')
        .eq('source', source)
        .like('link', '%google.com/search%');

      if (!sourceError && newsFromSource) {
        for (const news of newsFromSource) {
          const searchQuery = news.title.toLowerCase()
            .replace(/"/g, '')
            .replace(/'/g, '')
            .replace(/,/g, '')
            .replace(/ /g, '+');
          
          const improvedLink = `https://www.google.com/search?q=${searchQuery}+site:${site}`;

          await supabase
            .from('news')
            .update({ link: improvedLink })
            .eq('id', news.id);
        }
        console.log(`  ✓ ${source}: ${newsFromSource.length} enlaces mejorados`);
      }
    }

    // Step 4: Show summary
    console.log('\n📊 Verificando resultados finales...');
    
    const { data: summary, error: summaryError } = await supabase
      .from('news')
      .select('category, link');

    if (!summaryError && summary) {
      const stats = {};
      summary.forEach(item => {
        if (!stats[item.category]) {
          stats[item.category] = {
            total: 0,
            googleLinks: 0,
            otherLinks: 0
          };
        }
        stats[item.category].total++;
        
        if (item.link && item.link.includes('google.com')) {
          stats[item.category].googleLinks++;
        } else if (item.link) {
          stats[item.category].otherLinks++;
        }
      });

      console.log('\nResumen por categoría:');
      console.log('─'.repeat(50));
      Object.entries(stats).forEach(([category, stat]) => {
        console.log(`${category}: ${stat.googleLinks} Google, ${stat.otherLinks} otros (total: ${stat.total})`);
      });
    }

    console.log('\n✅ ¡Actualización completada con éxito!');
    console.log('Los enlaces ahora redirigen a búsquedas de Google relevantes.');
    console.log('\nPuedes verificar los cambios en: http://localhost:5173/?debug=newslinks');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Execute the update
updateNewsLinks();