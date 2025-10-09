import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react';
import { NewsCategory } from '../types';

interface CategoryStatsProps {
  category: NewsCategory;
  totalArticles: number;
  categoryColor: string;
}

// Estadísticas específicas por categoría
const categoryStats: Record<NewsCategory, Array<{ label: string; value: string; icon: any; trend?: string }>> = {
  'cybersecurity': [
    { label: 'Amenazas detectadas hoy', value: '2,847', icon: Activity, trend: '+15%' },
    { label: 'Vulnerabilidades críticas', value: '23', icon: TrendingUp, trend: '+3' },
    { label: 'Empresas afectadas', value: '156', icon: Users }
  ],
  'ai': [
    { label: 'Nuevos modelos IA', value: '18', icon: Activity, trend: '+6' },
    { label: 'Inversión total', value: '$2.3B', icon: TrendingUp, trend: '+22%' },
    { label: 'Startups activas', value: '1,234', icon: Users }
  ],
  'finance-crypto': [
    { label: 'Bitcoin', value: '$43,567', icon: Activity, trend: '+5.2%' },
    { label: 'Volumen 24h', value: '$28.4B', icon: TrendingUp, trend: '+12%' },
    { label: 'Nuevos proyectos DeFi', value: '89', icon: Users }
  ],
  'software-devops': [
    { label: 'Repositorios activos', value: '45.2K', icon: Activity, trend: '+8%' },
    { label: 'Deploys exitosos', value: '98.7%', icon: TrendingUp, trend: '+0.3%' },
    { label: 'Desarrolladores activos', value: '3.2M', icon: Users }
  ],
  'iot': [
    { label: 'Dispositivos conectados', value: '15.4B', icon: Activity, trend: '+18%' },
    { label: 'Datos procesados', value: '2.8PB', icon: TrendingUp, trend: '+25%' },
    { label: 'Nuevos protocolos', value: '12', icon: Users }
  ],
  'cloud': [
    { label: 'Servicios en la nube', value: '892', icon: Activity, trend: '+12' },
    { label: 'Uptime promedio', value: '99.98%', icon: TrendingUp, trend: '+0.01%' },
    { label: 'Migraciones activas', value: '2,341', icon: Users }
  ],
  'data-science': [
    { label: 'Datasets públicos', value: '12.5K', icon: Activity, trend: '+234' },
    { label: 'Modelos entrenados', value: '8.7M', icon: TrendingUp, trend: '+15%' },
    { label: 'Científicos de datos', value: '4.5M', icon: Users }
  ],
  'quantum': [
    { label: 'Qubits estables', value: '1,121', icon: Activity, trend: '+89' },
    { label: 'Algoritmos nuevos', value: '34', icon: TrendingUp, trend: '+7' },
    { label: 'Investigadores activos', value: '8.2K', icon: Users }
  ]
};

export function CategoryStats({ category, totalArticles, categoryColor }: CategoryStatsProps) {
  const stats = categoryStats[category] || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <BarChart3 className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Métricas del sector
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Artículos totales */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">Artículos hoy</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: categoryColor }}>
              {totalArticles}
            </span>
          </div>
        </div>

        {/* Estadísticas específicas de categoría */}
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <stat.icon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">{stat.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span 
                    className="text-sm font-medium"
                    style={{ color: stat.trend.includes('+') ? '#10b981' : '#ef4444' }}
                  >
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}