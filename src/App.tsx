import { useState, lazy, Suspense, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { DatabaseStatus } from './components/DatabaseStatus';
import { useTheme } from './hooks/useTheme';
import { NewsCategory } from './types';
import { Loader2 } from 'lucide-react';
import { LinkDebugDemo } from './components/LinkDebugDemo';
import { SupabaseDebug } from './components/SupabaseDebug';
import { NewsLinkDebug } from './components/NewsLinkDebug';

// Lazy load heavy components
const HubHome = lazy(() => import('./components/HubHome').then(module => ({ default: module.HubHome })));
const NewsFeed = lazy(() => import('./components/NewsFeed').then(module => ({ default: module.NewsFeed })));

function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<NewsCategory | null>(null);
  const [debugMode, setDebugMode] = useState<'none' | 'links' | 'supabase' | 'newslinks'>('none');

  useEffect(() => {
    // Check URL params for debug mode
    const params = new URLSearchParams(window.location.search);
    const debug = params.get('debug');
    if (debug === 'links') setDebugMode('links');
    else if (debug === 'supabase') setDebugMode('supabase');
    else if (debug === 'newslinks') setDebugMode('newslinks');
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-all duration-700">
      {/* Animated background patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      <div className="relative z-10">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <CategoryNav
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

      <main>
        {debugMode === 'links' ? (
          <LinkDebugDemo />
        ) : debugMode === 'supabase' ? (
          <SupabaseDebug />
        ) : debugMode === 'newslinks' ? (
          <NewsLinkDebug />
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 blur-xl">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full" />
                  </div>
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl">
                    <Loader2 className="w-16 h-16 text-gradient-animate animate-spin mx-auto" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Cargando contenido...</p>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          }>
            <div className="animate-appear">
              {activeCategory === null ? (
                <div className="fade-in-scale">
                  <HubHome onSelectCategory={setActiveCategory} />
                </div>
              ) : (
                <div className="slide-up">
                  <NewsFeed category={activeCategory} />
                </div>
              )}
            </div>
          </Suspense>
        )}
      </main>

        <footer className="relative mt-20 glass-premium dark:glass-premium-dark border-t border-gray-200/20 dark:border-gray-700/20">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent dark:from-gray-800/50 pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistema Operativo</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                TechNews Hub
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Plataforma premium de agregación de noticias tecnológicas con actualización en tiempo real
              </p>
              <div className="flex items-center justify-center gap-6 pt-4">
                <span className="text-xs text-gray-500 dark:text-gray-500">© 2025</span>
                <span className="text-xs text-gray-400 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">Versión 2.0</span>
                <span className="text-xs text-gray-400 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">Hecho con ❤️</span>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Indicador de estado de la base de datos */}
        <DatabaseStatus />
      </div>
    </div>
  );
}

export default App;
