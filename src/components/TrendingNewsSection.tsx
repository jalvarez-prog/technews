import { TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';

interface TrendingNewsSectionProps {
  articles: NewsArticle[];
  categoryColor: string;
}

export function TrendingNewsSection({ articles, categoryColor }: TrendingNewsSectionProps) {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <TrendingUp className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Tendencias del momento
        </h3>
      </div>

      <div className="space-y-4">
        {articles.slice(0, 5).map((article, index) => (
          <a
            key={article.id}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white"
              style={{ 
                backgroundColor: index === 0 ? categoryColor : `${categoryColor}99`,
                opacity: index === 0 ? 1 : 0.8 - (index * 0.15)
              }}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{article.source}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{timeAgo(article.pubDate)}</span>
                </div>
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>

      {articles.length > 5 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: categoryColor }}
          >
            Ver todas las tendencias
          </button>
        </div>
      )}
    </div>
  );
}