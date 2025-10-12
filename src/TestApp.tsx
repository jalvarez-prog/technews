import React from 'react';
import { NewsCard } from './components/NewsCard';
import { SimpleNewsCard } from './components/SimpleNewsCard';
import { NewsArticle } from './types';

// Test articles without importing from test file
const testArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Valid Article with Link',
    description: 'This article has a valid link',
    link: 'https://techcrunch.com/2024/01/01/valid-article',
    pubDate: new Date().toISOString(),
    source: 'TechCrunch',
    category: 'ai'
  },
  {
    id: '2',
    title: 'Article Without Link',
    description: 'This article is missing a link',
    link: '',
    pubDate: new Date().toISOString(),
    source: 'The Verge',
    category: 'ai'
  },
  {
    id: '3',
    title: 'Article with Protocol-less Link',
    description: 'This article has a link without protocol',
    link: 'example.com/article',
    pubDate: new Date().toISOString(),
    source: 'Example News',
    category: 'ai'
  },
  {
    id: '4',
    title: 'Article with Malformed URL',
    description: 'This article has a malformed URL',
    link: 'not-a-valid-url',
    pubDate: new Date().toISOString(),
    source: 'Bad URL News',
    category: 'ai'
  }
];

export function TestApp() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Test de Enlaces - Aislado</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          Esta es una versión aislada para probar los enlaces sin interferencia del resto de la aplicación.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">NewsCard Component (con tracking):</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {testArticles.slice(0, 2).map((article) => (
          <div key={article.id}>
            <div className="mb-2 p-2 bg-gray-100 rounded text-xs font-mono">
              Link: {article.link || 'null'}
            </div>
            <NewsCard article={article} />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">SimpleNewsCard Component (sin tracking):</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testArticles.slice(0, 2).map((article) => (
          <div key={`simple-${article.id}`}>
            <div className="mb-2 p-2 bg-gray-100 rounded text-xs font-mono">
              Link: {article.link || 'null'}
            </div>
            <SimpleNewsCard article={article} />
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800 font-semibold mb-2">Enlaces de prueba directos:</p>
        <div className="space-y-2">
          <a 
            href="https://www.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block"
          >
            → Enlace directo a Google (sin componentes React)
          </a>
          <a 
            href="https://techcrunch.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block"
          >
            → Enlace directo a TechCrunch
          </a>
        </div>
      </div>
    </div>
  );
}