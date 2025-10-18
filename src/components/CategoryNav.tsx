import { Home, TrendingUp } from 'lucide-react';
import { categories } from '../config/categories';
import { NewsCategory } from '../types';
import { useState, useEffect } from 'react';

interface CategoryNavProps {
  activeCategory: NewsCategory | null;
  onSelectCategory: (category: NewsCategory | null) => void;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <nav className="sticky top-[73px] z-40 glass-premium dark:glass-premium-dark border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg transition-all duration-500">
      <div className="relative w-full px-4 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-600/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-blue-600/10 opacity-50" />
        
        <div className="relative flex items-center justify-start md:justify-center gap-3 py-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onSelectCategory(null)}
            onMouseEnter={() => setHoveredCategory('home')}
            onMouseLeave={() => setHoveredCategory(null)}
            className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${
              activeCategory === null
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 scale-105'
                : 'glass-premium dark:glass-premium-dark text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-lg'
            } magnetic`}
            style={{ animationDelay: '0ms' }}
          >
            {activeCategory === null && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            <div className="relative flex items-center gap-2">
              <Home className={`w-4 h-4 ${activeCategory === null ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform duration-300`} />
              <span className="text-sm font-semibold">Inicio</span>
              {activeCategory === null && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
              )}
            </div>
          </button>

          {/* Category Pills with Enhanced Animations */}
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            const isActive = activeCategory === category.id;
            const isHovered = hoveredCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'glass-premium dark:glass-premium-dark text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-lg'
                } liquid magnetic`}
                style={{
                  animationDelay: `${(index + 1) * 50}ms`,
                  ...(isActive ? {
                    background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                    boxShadow: `0 8px 20px ${category.color}40`
                  } : {})
                }}
              >
                {/* Hover Effect Overlay */}
                {!isActive && (
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}15, transparent)`
                    }}
                  />
                )}
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-30" />
                  </div>
                )}
                
                <div className="relative flex items-center gap-2">
                  <div className={`relative ${isActive || isHovered ? 'scale-110' : ''} transition-transform duration-300`}>
                    <IconComponent 
                      className="w-4 h-4" 
                      style={{ color: isActive ? 'white' : category.color }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${
                    isActive ? '' : isHovered ? 'text-gradient' : ''
                  }`}>
                    {category.name}
                  </span>
                  
                  {/* Active pulse indicator */}
                  {isActive && (
                    <div className="ml-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                  
                  {/* Trending indicator for some categories */}
                  {index < 2 && !isActive && (
                    <TrendingUp className="w-3 h-3 text-red-500 animate-bounce" style={{ animationDelay: `${index * 200}ms` }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
