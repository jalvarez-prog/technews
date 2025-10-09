import { useState, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { useTheme } from './hooks/useTheme';
import { NewsCategory } from './types';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
const HubHome = lazy(() => import('./components/HubHome').then(module => ({ default: module.HubHome })));
const NewsFeed = lazy(() => import('./components/NewsFeed').then(module => ({ default: module.NewsFeed })));

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <main>
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          </div>
        }>
          {activeCategory === null ? (
            <HubHome onSelectCategory={setActiveCategory} />
          ) : (
            <NewsFeed category={activeCategory} />
          )}
        </Suspense>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p className="leading-relaxed">
              © 2025 TechNews Hub. Plataforma de agregación de noticias tecnológicas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
