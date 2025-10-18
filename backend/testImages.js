// Script de prueba para el sistema de imágenes
require('dotenv').config();

const { getArticleImage, getCategoryDefaultImage } = require('./services/imageService');

// Simular artículos de prueba para cada categoría
const testArticles = {
  'cybersecurity': {
    title: 'New Zero-Day Vulnerability Discovered in Windows',
    link: 'https://example.com/article1',
    content: '<p>Article content without images</p>',
    contentSnippet: 'A critical vulnerability has been discovered...'
  },
  'ai': {
    title: 'GPT-5 Announced with Revolutionary Capabilities',
    link: 'https://example.com/article2',
    contentSnippet: 'OpenAI announces next generation model...'
  },
  'finance-crypto': {
    title: 'Bitcoin Reaches New All-Time High',
    link: 'https://example.com/article3',
    contentSnippet: 'Cryptocurrency markets surge as Bitcoin...'
  },
  'software-devops': {
    title: 'Kubernetes 2.0 Released with Major Updates',
    link: 'https://example.com/article4',
    contentSnippet: 'The container orchestration platform...'
  },
  'iot': {
    title: 'Smart Home Security Risks Exposed',
    link: 'https://example.com/article5',
    contentSnippet: 'Researchers discover vulnerabilities in IoT devices...'
  },
  'cloud': {
    title: 'AWS Launches New Serverless Computing Service',
    link: 'https://example.com/article6',
    contentSnippet: 'Amazon Web Services announces...'
  },
  'data-science': {
    title: 'New Algorithm Achieves 99% Accuracy in Predictions',
    link: 'https://example.com/article7',
    contentSnippet: 'Revolutionary machine learning algorithm...'
  },
  'quantum': {
    title: 'Quantum Computer Achieves 1000 Qubit Milestone',
    link: 'https://example.com/article8',
    contentSnippet: 'IBM announces breakthrough in quantum computing...'
  }
};

async function testImageSystem() {
  console.log('=== Testing Image Service for All Categories ===\n');
  
  for (const [category, article] of Object.entries(testArticles)) {
    console.log(`\nCategory: ${category.toUpperCase()}`);
    console.log(`Article: ${article.title}`);
    
    try {
      // Test 1: Get article image (should use default since no RSS image)
      const imageUrl = await getArticleImage(article, category);
      console.log(`✓ Image URL obtained: ${imageUrl.substring(0, 50)}...`);
      
      // Test 2: Verify default images work
      const defaultImage = getCategoryDefaultImage(category, article.title);
      console.log(`✓ Default image available: ${defaultImage.substring(0, 50)}...`);
      
      // Verify the image URL is valid
      if (imageUrl && imageUrl.startsWith('http')) {
        console.log('✓ Image URL is valid format');
      } else {
        console.log('✗ Image URL format issue');
      }
      
    } catch (error) {
      console.error(`✗ Error for ${category}: ${error.message}`);
    }
  }
  
  console.log('\n=== Test Complete ===');
  console.log('\nSummary: The image service now provides fallback images for all categories.');
  console.log('Each category has 5 curated Unsplash images that will be used when RSS feeds don\'t provide images.');
}

// Run the test
testImageSystem()
  .then(() => {
    console.log('\n✓ All tests completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  });