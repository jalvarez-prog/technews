import { ExternalLink, Clock, TrendingUp, Bookmark, AlertCircle } from 'lucide-react';
import { NewsArticle } from '../types';
import { useState } from 'react';
import { getSafeArticleUrl, trackLinkClick, getDomainFromUrl, isValidUrl } from '../utils/linkUtils';

interface FeaturedNewsCardProps {
  article: NewsArticle;
  categoryColor: string;
}

export function FeaturedNewsCard({ article, categoryColor }: FeaturedNewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  // Get safe URL for the article
  const articleUrl = getSafeArticleUrl(article.link, article.source, article.title);
  const isOriginalLink = isValidUrl(article.link);
  const domain = getDomainFromUrl(articleUrl);

  // Handle click tracking
  const handleClick = () => {
    // Simple non-blocking tracking
    trackLinkClick(article.id, article.title, article.source, articleUrl);
    
    if (!isOriginalLink) {
      console.info(`Using search fallback for: ${article.title}`);
    }
  };

  return (
    <article className="group relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Featured Badge */}
      <div 
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm"
        style={{ backgroundColor: `${categoryColor}dd` }}
      >
        <TrendingUp className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-semibold">Destacado</span>
      </div>

      {/* Bookmark Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsBookmarked(!isBookmarked);
        }}
        className="absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-white text-white' : 'text-white'}`} />
      </button>

      <a
        href={articleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        onClick={handleClick}
        title={`Leer artículo completo${domain ? ` en ${domain}` : ''}`}
      >
        <div className="relative h-96">
          {article.imageUrl && !imageError ? (
            <>
              <img
                src={article.imageUrl}
                alt={article.title}
                loading="lazy"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-4 text-sm text-gray-300">
              <span 
                className="font-semibold text-white px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${categoryColor}aa` }}
              >
                {article.source}
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{timeAgo(article.pubDate)}</span>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-3 line-clamp-3 group-hover:text-blue-300 transition-colors">
              {article.title}
            </h3>

            {article.description && (
              <p className="text-gray-300 text-lg leading-relaxed line-clamp-2 mb-4">
                {article.description}
              </p>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white font-medium group-hover:text-blue-300 transition-colors">
                <span>Leer artículo completo</span>
                <ExternalLink className="w-5 h-5" />
              </div>
              {!isOriginalLink && (
                <div className="flex items-center gap-1 text-amber-300" title="Enlace de búsqueda alternativo">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}