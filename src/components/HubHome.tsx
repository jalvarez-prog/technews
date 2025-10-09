import { ArrowRight, Zap } from 'lucide-react';
import { categories } from '../config/categories';
import { NewsCategory } from '../types';

interface HubHomeProps {
  onSelectCategory: (category: NewsCategory) => void;
}

export function HubHome({ onSelectCategory }: HubHomeProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Bienvenido a TechNews Hub
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Tu fuente centralizada de noticias tecnológicas. Explora las últimas actualizaciones en 8 categorías especializadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                style={{ backgroundColor: category.color }}
              />

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <IconComponent
                    className="w-7 h-7"
                    style={{ color: category.color }}
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Explora las últimas noticias y tendencias
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all" style={{ color: category.color }}>
                  <span>Ver noticias</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 text-center border border-blue-100 dark:border-gray-600">
        <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Noticias en Tiempo Real
        </h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
          Agregamos contenido de las fuentes más confiables para mantenerte actualizado con las últimas innovaciones tecnológicas.
        </p>
      </div>
    </div>
  );
}
