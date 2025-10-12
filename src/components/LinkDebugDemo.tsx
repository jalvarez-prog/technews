import React from 'react';
import { NewsArticle } from '../types';
import { getSafeArticleUrl, isValidUrl } from '../utils/linkUtils';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';

// Test articles with various link scenarios
const testArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Article with valid HTTPS link',
    description: 'This article has a proper HTTPS link',
    link: 'https://www.example.com/article1',
    pubDate: new Date().toISOString(),
    source: 'Example News',
    category: 'ai'
  },
  {
    id: '2', 
    title: 'Article with HTTP link',
    description: 'This article has an HTTP link',
    link: 'http://example.org/article2',
    pubDate: new Date().toISOString(),
    source: 'Example Org',
    category: 'ai'
  },
  {
    id: '3',
    title: 'Article without protocol',
    description: 'This article link lacks protocol',
    link: 'www.example.net/article3',
    pubDate: new Date().toISOString(),
    source: 'Example Net',
    category: 'ai'
  },
  {
    id: '4',
    title: 'Article with // prefix',
    description: 'This article has protocol-relative URL',
    link: '//example.io/article4',
    pubDate: new Date().toISOString(),
    source: 'Example IO',
    category: 'ai'
  },
  {
    id: '5',
    title: 'Article with empty link',
    description: 'This article has an empty link string',
    link: '',
    pubDate: new Date().toISOString(),
    source: 'Empty Link News',
    category: 'ai'
  },
  {
    id: '6',
    title: 'Article with null link',
    description: 'This article has null as link',
    link: null as any, // Simulating null from API
    pubDate: new Date().toISOString(),
    source: 'Null Link News',
    category: 'ai'
  },
  {
    id: '7',
    title: 'Article with undefined link',
    description: 'This article has undefined as link',
    link: undefined as any, // Simulating undefined from API
    pubDate: new Date().toISOString(),
    source: 'Undefined Link News',
    category: 'ai'
  }
];

export function LinkDebugDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Link Debug Demo</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Testing different link scenarios to ensure all articles have working URLs
        </p>
      </div>

      <div className="space-y-4">
        {testArticles.map((article) => {
          const safeUrl = getSafeArticleUrl(article.link, article.source, article.title);
          const isOriginal = isValidUrl(article.link);
          
          return (
            <div key={article.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{article.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{article.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Original Link:</p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                      {JSON.stringify(article.link)}
                    </code>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Processed URL:</p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded block overflow-x-auto">
                      {safeUrl}
                    </code>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {isOriginal ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Original link</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-600">Fallback search</span>
                      </>
                    )}
                  </div>
                  
                  <a
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Test Link
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Summary:</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          All articles should have a working link. Articles without valid URLs will automatically 
          redirect to a Google search with the article title and source.
        </p>
      </div>
    </div>
  );
}