import { useState, useMemo } from 'react';
import { NewsCategory, NewsArticle } from '../types';
import { NewsCard } from './NewsCard';
import { FeaturedNewsCard } from './FeaturedNewsCard';
import { TrendingNewsSection } from './TrendingNewsSection';
import { CategoryStats } from './CategoryStats';
import { CategoryResources } from './CategoryResources';
import { NewsFilters, FilterState } from './NewsFilters';
import { Shield, Brain, TrendingUp, Code, Wifi, Cloud, BarChart3, Atom } from 'lucide-react';

interface CategoryNewsFeedProps {
  category: NewsCategory;
  articles: NewsArticle[];
  categoryConfig: {
    name: string;
    color: string;
    icon: any; // Using any temporarily to accept LucideIcon
  };
}

// Mapeo de iconos por categoría
const categoryIcons = {
  'cybersecurity': Shield,
  'ai': Brain,
  'finance-crypto': TrendingUp,
  'software-devops': Code,
  'iot': Wifi,
  'cloud': Cloud,
  'data-science': BarChart3,
  'quantum': Atom
};

export function CategoryNewsFeed({ category, articles, categoryConfig }: CategoryNewsFeedProps) {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    sources: [],
    tags: []
  });

  // Aplicar filtros a los artículos
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filtro por tiempo
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.pubDate);
        return now.getTime() - articleDate.getTime() <= timeRanges[filters.timeRange];
      });
    }

    // Filtro por fuentes
    if (filters.sources.length > 0) {
      filtered = filtered.filter(article => 
        filters.sources.includes(article.source)
      );
    }

    // Filtro por tags (simulado - en producción vendría del backend)
    if (filters.tags.length > 0) {
      filtered = filtered.filter(article => {
        const articleText = (article.title + ' ' + article.description).toLowerCase();
        return filters.tags.some(tag => articleText.includes(tag.toLowerCase()));
      });
    }

    return filtered;
  }, [articles, filters]);

  // Seleccionar artículo destacado (el más reciente)
  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  // Artículos para la sección de tendencias (los siguientes 5-10 más recientes)
  const trendingArticles = articles.slice(0, 10);

  return (
    <div className="w-full">
      {/* Header de categoría con descripción */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 mb-8">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-3 rounded-xl shadow-lg"
              style={{ backgroundColor: categoryConfig.color }}
            >
              {(() => {
                const Icon = categoryConfig.icon || categoryIcons[category] || Cloud;
                return <Icon className="w-8 h-8 text-white" />;
              })()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {categoryConfig.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Las últimas noticias, tendencias y recursos del mundo de {categoryConfig.name.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4">
        {/* Filtros avanzados */}
        <NewsFilters 
          category={category}
          categoryColor={categoryConfig.color}
          onFiltersChange={setFilters}
        />

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna principal - 8 columnas */}
          <div className="lg:col-span-8 space-y-8">
            {/* Noticia destacada */}
            {featuredArticle && (
              <FeaturedNewsCard 
                article={featuredArticle}
                categoryColor={categoryConfig.color}
              />
            )}

            {/* Grid de noticias regulares */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Más noticias de {categoryConfig.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Mensaje si no hay más artículos */}
            {regularArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No se encontraron más noticias con los filtros seleccionados
                </p>
              </div>
            )}
          </div>

          {/* Columna lateral - 4 columnas */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sección de tendencias */}
            <div className="sticky top-4 space-y-6">
              <TrendingNewsSection 
                articles={trendingArticles}
                categoryColor={categoryConfig.color}
              />

              {/* Estadísticas de la categoría */}
              <CategoryStats 
                category={category}
                totalArticles={articles.length}
                categoryColor={categoryConfig.color}
              />

              {/* Recursos de la categoría */}
              <CategoryResources 
                category={category}
                categoryColor={categoryConfig.color}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}