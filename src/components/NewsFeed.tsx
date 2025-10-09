import { useState, useMemo, lazy, Suspense } from 'react';
import { NewsCategory } from '../types';
import { useNews } from '../hooks/useNews';
import SlimNewsTicker from './SlimNewsTicker';
import { Loader2, AlertCircle } from 'lucide-react';
import { categories } from '../config/categories';

// Lazy load CategoryNewsFeed component
const CategoryNewsFeed = lazy(() => import('./CategoryNewsFeed').then(module => ({ default: module.CategoryNewsFeed })));

interface NewsFeedProps {
  category: NewsCategory;
}

export function NewsFeed({ category }: NewsFeedProps) {
  const { articles, loading, error } = useNews(category);

  const categoryConfig = categories.find(c => c.id === category);

  const filteredArticles = useMemo(() => {
    return articles;
  }, [articles]);

  // Si tenemos artículos y la configuración de categoría, usar el nuevo CategoryNewsFeed
  if (!loading && !error && categoryConfig && articles.length > 0) {
    return (
      <div>
        <SlimNewsTicker category={category} />
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        }>
          <CategoryNewsFeed
            category={category}
            articles={filteredArticles}
            categoryConfig={categoryConfig}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div>
      <SlimNewsTicker category={category} />

      <div className="w-full py-6">
        <div className="flex-1 max-w-[1200px] mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Cargando noticias...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No hay noticias disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
