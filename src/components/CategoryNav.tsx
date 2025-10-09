import { Home } from 'lucide-react';
import { categories } from '../config/categories';
import { NewsCategory } from '../types';

interface CategoryNavProps {
  activeCategory: NewsCategory | null;
  onSelectCategory: (category: NewsCategory | null) => void;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <nav className="sticky top-[73px] z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full px-4">
        <div className="flex items-center justify-center gap-2 py-3 flex-wrap">
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeCategory === null
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-xs font-medium">Inicio</span>
          </button>

          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: category.color }
                    : undefined
                }
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
