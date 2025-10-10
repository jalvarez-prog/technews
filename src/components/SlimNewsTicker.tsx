import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { NewsCategory } from '../types';
import { useTicker } from '../hooks/useTicker';

interface SlimNewsTickerProps {
  category: NewsCategory;
}

const SlimNewsTicker: React.FC<SlimNewsTickerProps> = ({ category }) => {
  const { tickerItems: newsData, loading } = useTicker(category);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'trending': return 'border-purple-500 bg-purple-500/10';
      case 'hot': return 'border-pink-500 bg-pink-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'trending': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'hot': return 'bg-pink-500/20 text-pink-400 border-pink-500';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center">
        <div className="text-cyan-400 flex items-center gap-2 text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span>Cargando feed...</span>
        </div>
      </div>
    );
  }

  // Duplicar las noticias para loop infinito
  const duplicatedNews = [...newsData, ...newsData];

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Ticker Container */}
      <div className="relative h-16 overflow-hidden">
        {/* Live Indicator */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-white dark:bg-gray-900/95 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-red-400 text-xs font-bold uppercase">Live</span>
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent"></div>
        </div>

        {/* Scrolling animation using CSS */}
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
          .ticker-card {
            transition: all 0.3s ease;
          }
          .ticker-card:hover {
            transform: scale(1.05) translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `}</style>

        {/* Scrolling cards */}
        <div className="flex items-center gap-3 h-full pl-32 animate-scroll">
          {duplicatedNews.map((news, index) => (
            <a
              key={`${news.id}-${index}`}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 no-underline"
              onClick={(e) => {
                // Pausar animación brevemente al hacer clic
                e.currentTarget.parentElement?.classList.add('hover:pause');
              }}
            >
              <div className={`ticker-card h-12 bg-gray-50 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg border ${getSeverityColor(news.severity)} overflow-hidden shadow-sm px-4 flex items-center gap-3 group`}>
                {/* Icon & Severity */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">{news.icon}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${getSeverityBadge(news.severity)} font-semibold uppercase whitespace-nowrap`}>
                    {news.severity}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {news.title}
                </h3>

                {/* Category */}
                <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                  {news.category}
                </span>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="whitespace-nowrap">{news.time}</span>
                </div>

                {/* Source with link indicator */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium whitespace-nowrap">{news.source}</span>
                  <ExternalLink className="w-3 h-3 text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlimNewsTicker;