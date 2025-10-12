import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the database
const dbPath = path.join(__dirname, '..', 'news.db');
const db = new Database(dbPath, { readonly: true });

try {
  // Get a sample of articles with their links
  const stmt = db.prepare(`
    SELECT id, title, link, source, category
    FROM news_articles
    ORDER BY pub_date DESC
    LIMIT 20
  `);
  
  const articles = stmt.all();
  
  console.log('=== Checking Article Links ===\n');
  
  articles.forEach((article, index) => {
    console.log(`Article ${index + 1}:`);
    console.log(`  Title: ${article.title.substring(0, 60)}...`);
    console.log(`  Source: ${article.source}`);
    console.log(`  Category: ${article.category}`);
    console.log(`  Link: ${article.link || 'NO LINK'}`);
    console.log(`  Link type: ${typeof article.link}`);
    console.log(`  Link length: ${article.link ? article.link.length : 0}`);
    console.log('---');
  });
  
  // Check for articles with missing or empty links
  const countStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN link IS NULL THEN 1 ELSE 0 END) as null_links,
      SUM(CASE WHEN link = '' THEN 1 ELSE 0 END) as empty_links,
      SUM(CASE WHEN link IS NOT NULL AND link != '' THEN 1 ELSE 0 END) as valid_links
    FROM news_articles
  `);
  
  const counts = countStmt.get();
  console.log('\n=== Link Statistics ===');
  console.log(`Total articles: ${counts.total}`);
  console.log(`Articles with NULL links: ${counts.null_links}`);
  console.log(`Articles with empty links: ${counts.empty_links}`);
  console.log(`Articles with valid links: ${counts.valid_links}`);
  
} catch (error) {
  console.error('Error querying database:', error);
} finally {
  db.close();
}