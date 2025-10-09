import { Filter, Calendar, Tag, Globe } from 'lucide-react';
import { NewsCategory } from '../types';
import { useState } from 'react';

interface NewsFiltersProps {
  category: NewsCategory;
  categoryColor: string;
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  timeRange: 'today' | 'week' | 'month' | 'all';
  sources: string[];
  tags: string[];
}

// Tags específicos por categoría
const categoryTags: Record<NewsCategory, string[]> = {
  'cybersecurity': ['ransomware', 'phishing', 'zero-day', 'vulnerabilidad', 'breach', 'malware', 'firewall', 'encriptación'],
  'ai': ['machine-learning', 'deep-learning', 'gpt', 'computer-vision', 'nlp', 'robotica', 'etica-ai', 'agi'],
  'finance-crypto': ['bitcoin', 'ethereum', 'defi', 'nft', 'blockchain', 'trading', 'stablecoin', 'regulación'],
  'software-devops': ['kubernetes', 'docker', 'ci-cd', 'microservicios', 'cloud-native', 'agile', 'testing', 'git'],
  'iot': ['sensores', 'mqtt', 'edge-computing', 'arduino', 'raspberry-pi', '5g', 'smart-home', 'industrial-iot'],
  'cloud': ['aws', 'azure', 'gcp', 'serverless', 'iaas', 'paas', 'saas', 'multi-cloud'],
  'data-science': ['big-data', 'analytics', 'visualization', 'python', 'r-language', 'sql', 'spark', 'tableau'],
  'quantum': ['qubit', 'superposicion', 'entrelazamiento', 'algoritmo-cuantico', 'ibm-q', 'hardware-cuantico', 'criptografia-cuantica']
};

// Fuentes comunes por categoría
const categorySources: Record<NewsCategory, string[]> = {
  'cybersecurity': ['The Hacker News', 'Dark Reading', 'Bleeping Computer', 'KrebsOnSecurity'],
  'ai': ['AI News', 'Synced Review', 'MIT Technology Review', 'OpenAI Blog'],
  'finance-crypto': ['CoinTelegraph', 'CoinDesk', 'The Block', 'Decrypt'],
  'software-devops': ['InfoQ', 'DevOps.com', 'The New Stack', 'DZone'],
  'iot': ['IoT Analytics', 'IoT For All', 'IoT World Today', 'Stacey on IoT'],
  'cloud': ['Cloud Computing News', 'AWS Blog', 'Google Cloud Blog', 'Azure Blog'],
  'data-science': ['KDnuggets', 'Towards Data Science', 'DataCamp', 'Analytics Vidhya'],
  'quantum': ['Quantum Computing Report', 'The Quantum Insider', 'Quantum Magazine']
};

export function NewsFilters({ category, categoryColor, onFiltersChange }: NewsFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    timeRange: 'all',
    sources: [],
    tags: []
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const tags = categoryTags[category] || [];
  const sources = categorySources[category] || [];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const toggleSource = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    updateFilters({ sources: newSources });
  };

  const activeFiltersCount = filters.tags.length + filters.sources.length + (filters.timeRange !== 'all' ? 1 : 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <Filter className="w-5 h-5" style={{ color: categoryColor }} />
          </div>
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Filtros avanzados
          </span>
          {activeFiltersCount > 0 && (
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {activeFiltersCount} activos
            </span>
          )}
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6">
          {/* Filtro por tiempo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Período de tiempo</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['today', 'week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => updateFilters({ timeRange: range })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.timeRange === range
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: filters.timeRange === range ? categoryColor : undefined
                  }}
                >
                  {range === 'today' && 'Hoy'}
                  {range === 'week' && 'Esta semana'}
                  {range === 'month' && 'Este mes'}
                  {range === 'all' && 'Todo'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por tags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Etiquetas populares</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.tags.includes(tag)
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: filters.tags.includes(tag) ? categoryColor : undefined
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por fuentes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-gray-900 dark:text-white">Fuentes</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((source) => (
                <label
                  key={source}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.sources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="w-4 h-4 rounded accent-current"
                    style={{ accentColor: categoryColor }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botón de limpiar filtros */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setFilters({ timeRange: 'all', sources: [], tags: [] });
                  onFiltersChange({ timeRange: 'all', sources: [], tags: [] });
                }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}