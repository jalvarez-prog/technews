import { Moon, Sun, Newspaper, Sparkles, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-premium dark:glass-premium-dark shadow-2xl' 
          : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl'
      } border-b ${
        scrolled
          ? 'border-gray-200/20 dark:border-gray-700/20'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section with Animations */}
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Newspaper className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Technium Hub
                </h1>
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Noticias de Tecnología en Tiempo Real
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            {/* Premium Badge */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">PREMIUM</span>
            </div>

            {/* Theme Toggle with Animation */}
            <button
              onClick={onToggleTheme}
              className="group relative p-3 rounded-xl glass-premium dark:glass-premium-dark hover:scale-110 transition-all duration-300 magnetic"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="relative">
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform duration-300" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-45 transition-transform duration-300" />
                )}
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl glass-premium dark:glass-premium-dark hover:scale-110 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">PREMIUM ACCESS</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
