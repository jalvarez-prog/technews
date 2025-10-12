// Script to check news links in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ikncshcpewwtdxoefkwx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbmNzaGNwZXd3dGR4b2Vma3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NDMyNjAsImV4cCI6MjA1MjExOTI2MH0.UJ4vfYQo6SUY-eaKQs2ANjqnAmzr0yLGQIBT3ILpDGk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNewsLinks() {
  console.log('Checking news links in database...\n');
  
  try {
    // Get a sample of news items from each category
    const { data, error } = await supabase
      .from('news')
      .select('id, title, link, source, category')
      .limit(50)
      .order('pub_date', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return;
    }

    console.log(`Found ${data.length} news items\n`);

    // Analyze links
    let noLink = 0;
    let invalidLink = 0;
    let exampleLink = 0;
    let validLink = 0;

    data.forEach(item => {
      if (!item.link || item.link.trim() === '') {
        noLink++;
        console.log(`❌ No link: "${item.title}" (${item.category})`);
      } else if (item.link.includes('example.com')) {
        exampleLink++;
        console.log(`⚠️  Example.com link: "${item.title}" - ${item.link}`);
      } else if (!item.link.startsWith('http://') && !item.link.startsWith('https://')) {
        invalidLink++;
        console.log(`⚠️  Invalid link format: "${item.title}" - ${item.link}`);
      } else {
        validLink++;
      }
    });

    console.log('\n--- Summary ---');
    console.log(`Total items: ${data.length}`);
    console.log(`✅ Valid links: ${validLink}`);
    console.log(`❌ No link: ${noLink}`);
    console.log(`⚠️  Example.com links: ${exampleLink}`);
    console.log(`⚠️  Invalid format: ${invalidLink}`);

    // Show sample of valid links
    if (validLink > 0) {
      console.log('\n--- Sample of valid links ---');
      data.filter(item => 
        item.link && 
        (item.link.startsWith('http://') || item.link.startsWith('https://')) &&
        !item.link.includes('example.com')
      ).slice(0, 5).forEach(item => {
        console.log(`✅ "${item.title}" - ${item.link}`);
      });
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

checkNewsLinks();