import { Bookmark, ExternalLink, Star } from 'lucide-react';
import { NewsCategory } from '../types';

interface Resource {
  name: string;
  description: string;
  url: string;
  type: 'tool' | 'course' | 'documentation' | 'community';
  isPopular?: boolean;
}

const categoryResources: Record<NewsCategory, Resource[]> = {
  'cybersecurity': [
    { name: 'OWASP Top 10', description: 'Guía de vulnerabilidades web más comunes', url: '#', type: 'documentation', isPopular: true },
    { name: 'Metasploit', description: 'Framework de pruebas de penetración', url: '#', type: 'tool' },
    { name: 'HackTheBox', description: 'Plataforma de práctica de hacking ético', url: '#', type: 'course' },
    { name: 'r/cybersecurity', description: 'Comunidad de Reddit sobre ciberseguridad', url: '#', type: 'community' }
  ],
  'ai': [
    { name: 'Hugging Face', description: 'Plataforma de modelos de IA', url: '#', type: 'tool', isPopular: true },
    { name: 'Fast.ai', description: 'Cursos gratuitos de deep learning', url: '#', type: 'course' },
    { name: 'Papers with Code', description: 'Últimas investigaciones en IA', url: '#', type: 'documentation' },
    { name: 'AI Alignment Forum', description: 'Discusiones sobre seguridad en IA', url: '#', type: 'community' }
  ],
  'finance-crypto': [
    { name: 'CoinGecko', description: 'Datos y análisis de criptomonedas', url: '#', type: 'tool', isPopular: true },
    { name: 'DeFi Pulse', description: 'Métricas del ecosistema DeFi', url: '#', type: 'tool' },
    { name: 'Crypto Zombies', description: 'Aprende desarrollo blockchain jugando', url: '#', type: 'course' },
    { name: 'r/CryptoCurrency', description: 'Comunidad cripto más grande', url: '#', type: 'community' }
  ],
  'software-devops': [
    { name: 'GitHub Actions', description: 'CI/CD automatizado', url: '#', type: 'tool', isPopular: true },
    { name: 'Docker Hub', description: 'Registro de imágenes de contenedores', url: '#', type: 'tool' },
    { name: 'DevOps Roadmap', description: 'Guía completa para DevOps', url: '#', type: 'documentation' },
    { name: 'DevOps subreddit', description: 'Comunidad de profesionales DevOps', url: '#', type: 'community' }
  ],
  'iot': [
    { name: 'Arduino IDE', description: 'Desarrollo para dispositivos IoT', url: '#', type: 'tool', isPopular: true },
    { name: 'MQTT Explorer', description: 'Cliente MQTT para debugging', url: '#', type: 'tool' },
    { name: 'IoT For All', description: 'Recursos educativos IoT', url: '#', type: 'course' },
    { name: 'ThingsBoard', description: 'Plataforma IoT open source', url: '#', type: 'documentation' }
  ],
  'cloud': [
    { name: 'Terraform', description: 'Infraestructura como código', url: '#', type: 'tool', isPopular: true },
    { name: 'AWS Free Tier', description: 'Servicios cloud gratuitos', url: '#', type: 'tool' },
    { name: 'Cloud Native Trail Map', description: 'Guía CNCF para cloud native', url: '#', type: 'documentation' },
    { name: 'r/aws', description: 'Comunidad de AWS', url: '#', type: 'community' }
  ],
  'data-science': [
    { name: 'Jupyter Notebook', description: 'Entorno interactivo para data science', url: '#', type: 'tool', isPopular: true },
    { name: 'Kaggle', description: 'Competencias y datasets', url: '#', type: 'tool' },
    { name: 'Towards Data Science', description: 'Blog de ciencia de datos', url: '#', type: 'documentation' },
    { name: 'DataCamp', description: 'Cursos interactivos de datos', url: '#', type: 'course' }
  ],
  'quantum': [
    { name: 'Qiskit', description: 'SDK de IBM para computación cuántica', url: '#', type: 'tool', isPopular: true },
    { name: 'Quantum Computing Report', description: 'Noticias del sector cuántico', url: '#', type: 'documentation' },
    { name: 'Microsoft Q#', description: 'Lenguaje de programación cuántica', url: '#', type: 'tool' },
    { name: 'Quantum Computing SE', description: 'Stack Exchange de computación cuántica', url: '#', type: 'community' }
  ]
};

const typeConfig = {
  tool: { icon: '🔧', label: 'Herramienta', color: '#3b82f6' },
  course: { icon: '📚', label: 'Curso', color: '#10b981' },
  documentation: { icon: '📄', label: 'Documentación', color: '#8b5cf6' },
  community: { icon: '👥', label: 'Comunidad', color: '#f59e0b' }
};

interface CategoryResourcesProps {
  category: NewsCategory;
  categoryColor: string;
}

export function CategoryResources({ category, categoryColor }: CategoryResourcesProps) {
  const resources = categoryResources[category] || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          <Bookmark className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Recursos esenciales
        </h3>
      </div>

      <div className="space-y-3">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{typeConfig[resource.type].icon}</span>
                  <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {resource.name}
                  </h4>
                  {resource.isPopular && (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {resource.description}
                </p>
                <span 
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${typeConfig[resource.type].color}20`,
                    color: typeConfig[resource.type].color
                  }}
                >
                  {typeConfig[resource.type].label}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button 
          className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
          style={{ backgroundColor: categoryColor }}
        >
          Ver todos los recursos
        </button>
      </div>
    </div>
  );
}