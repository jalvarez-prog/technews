import { ArrowRight, Zap, TrendingUp, Globe, Users, Sparkles, ChevronRight, Activity, Rocket, Star } from 'lucide-react';
import { categories } from '../config/categories';
import { NewsCategory } from '../types';
import { useState, useEffect, useRef } from 'react';

interface HubHomeProps {
  onSelectCategory: (category: NewsCategory) => void;
}

export function HubHome({ onSelectCategory }: HubHomeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { icon: TrendingUp, value: '1000+', label: 'Artículos Diarios', color: '#3B82F6' },
    { icon: Globe, value: '50+', label: 'Fuentes Globales', color: '#8B5CF6' },
    { icon: Users, value: '10K+', label: 'Lectores Activos', color: '#EC4899' },
    { icon: Activity, value: '24/7', label: 'Actualización', color: '#10B981' },
  ];

  return (
    <div className="relative">
      {/* Hero Section with Advanced Animations */}
      <div ref={heroRef} className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Animated background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 aurora opacity-20 dark:opacity-10" />
          <div 
            className="absolute inset-0 transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
            }}
          >
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 blob-morph" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 blob-morph" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 blob-morph" style={{ animationDelay: '4s' }} />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 dark:via-gray-950/80 to-white dark:to-gray-950" />
        
        <div className="relative max-w-[1200px] mx-auto px-4 py-16 md:py-24 z-10">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-premium dark:glass-premium-dark border-gradient dark:border-gradient-dark mb-8 hover:scale-105 transition-transform duration-300 cursor-default">
              <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plataforma Premium de Noticias Tech</span>
              <div className="flex gap-1 ml-2">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 relative">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-gradient-animate blur-xl opacity-50">TechNews</span>
                <span className="relative text-gradient-animate">TechNews</span>
              </span>
              <span className="text-gray-900 dark:text-white relative">
                <span className="absolute inset-0 blur-xl opacity-30">Hub</span>
                <span className="relative"> Hub</span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12 font-light slide-up">
              Tu puerta de entrada al futuro tecnológico. Descubre las últimas innovaciones,
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"> tendencias y avances</span> en el mundo de la tecnología.
            </p>

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`group relative bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 transition-all duration-500 animate-appear stagger-${index + 1} spotlight`}
                    style={{ animationFillMode: 'both' }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${stat.color}10, transparent 70%)`
                      }}
                    />
                    <div 
                      className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-500" 
                      style={{ 
                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                        boxShadow: `0 8px 20px ${stat.color}15`
                      }}>
                      <Icon className="w-7 h-7" style={{ color: stat.color }} />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid with Enhanced Cards */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explora por Categorías
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Selecciona una categoría para descubrir las últimas noticias especializadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`group relative glass-premium dark:glass-premium-dark rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 overflow-hidden parallax animate-appear stagger-${index + 1} liquid`}
                style={{ animationFillMode: 'both' }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`
                  }}
                />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer" />

                <div className="relative z-10">
                  {/* Icon with animated background */}
                  <div className="relative mb-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`,
                        boxShadow: `0 10px 30px ${category.color}20`
                      }}
                    >
                      <IconComponent
                        className="w-8 h-8 transition-all duration-500 group-hover:scale-110"
                        style={{ color: category.color }}
                      />
                    </div>
                    
                    {/* Pulse indicator */}
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full pulse-subtle"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gradient transition-all duration-500">
                    {category.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Descubre las últimas tendencias y novedades
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      +100 artículos
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all duration-300" 
                         style={{ color: category.color }}>
                      <span>Explorar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Premium CTA Section with Advanced Effects */}
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl group">
          <div className="absolute inset-0 aurora opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-700/20" />
          
          <div className="relative glass-premium dark:glass-premium-dark backdrop-blur-2xl rounded-3xl p-10 md:p-16 text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 blur-3xl opacity-50">
                <Zap className="w-20 h-20 text-white" />
              </div>
              <Zap className="relative w-20 h-20 text-white mx-auto float-animation neon-glow" />
            </div>
            
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 relative">
              <span className="absolute inset-0 blur-xl opacity-50">Mantente Actualizado</span>
              <span className="relative">Mantente Actualizado</span>
            </h3>
            
            <p className="text-white/95 text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-light">
              Accede a más de <span className="font-bold text-2xl">1000</span> artículos diarios de las fuentes más confiables del mundo tecnológico.
              <br />Información verificada, actualizada en <span className="text-gradient-animate font-semibold">tiempo real</span>.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="group/badge inline-flex items-center gap-3 px-8 py-4 glass-premium backdrop-blur-xl rounded-2xl border border-white/30 hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                  <div className="relative w-3 h-3 bg-green-400 rounded-full" />
                </div>
                <span className="text-white font-semibold text-lg">Actualización en vivo</span>
              </div>
              <div className="inline-flex items-center gap-3 px-8 py-4 glass-premium backdrop-blur-xl rounded-2xl border border-white/30 hover:scale-105 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-lg">8 categorías especializadas</span>
              </div>
            </div>
            
            <button className="group/btn relative px-10 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl border-2 border-white/50 transition-all duration-300 hover:scale-105 magnetic">
              <span className="text-white font-bold text-lg flex items-center gap-3">
                Comenzar ahora
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
