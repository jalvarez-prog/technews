import React from 'react';
import { NewsArticle } from '../types';

interface SimpleNewsCardProps {
  article: NewsArticle;
}

export function SimpleNewsCard({ article }: SimpleNewsCardProps) {
  // Generate the URL directly without any utilities
  const articleUrl = article.link || `https://www.google.com/search?q=${encodeURIComponent(article.title + ' ' + article.source)}`;
  
  return (
    <article className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
      <p className="text-gray-600 mb-4">{article.description}</p>
      
      <div className="space-y-2">
        {/* Simple link - no handlers, no tracking */}
        <a 
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-600 hover:underline"
        >
          Leer artículo →
        </a>
        
        <div className="text-xs text-gray-500">
          URL: {articleUrl}
        </div>
      </div>
    </article>
  );
}