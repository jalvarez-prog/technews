import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export function NewsLinkDebug() {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    empty: 0,
    example: 0,
    invalid: 0
  });

  useEffect(() => {
    async function checkLinks() {
      setLoading(true);
      try {
        // Fetch recent news items
        const { data, error } = await supabase
          .from('news')
          .select('id, title, link, source, category')
          .order('pub_date', { ascending: false })
          .limit(30);

        if (error) {
          console.error('Error fetching news:', error);
          return;
        }

        if (data) {
          setNewsItems(data);
          
          // Calculate stats
          const newStats = {
            total: data.length,
            valid: 0,
            empty: 0,
            example: 0,
            invalid: 0
          };

          data.forEach(item => {
            if (!item.link || item.link.trim() === '') {
              newStats.empty++;
            } else if (item.link.includes('example.com')) {
              newStats.example++;
            } else if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
              newStats.valid++;
            } else {
              newStats.invalid++;
            }
          });

          setStats(newStats);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkLinks();
  }, []);

  const getLinkStatus = (link: string) => {
    if (!link || link.trim() === '') {
      return { icon: XCircle, color: 'text-red-500', status: 'Sin enlace' };
    }
    if (link.includes('example.com')) {
      return { icon: AlertCircle, color: 'text-amber-500', status: 'example.com' };
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return { icon: CheckCircle, color: 'text-green-500', status: 'Válido' };
    }
    return { icon: AlertCircle, color: 'text-orange-500', status: 'Formato inválido' };
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Debug: Enlaces de Noticias en Base de Datos</h2>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          <div className="text-sm text-green-600">Enlaces válidos</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.empty}</div>
          <div className="text-sm text-red-600">Sin enlace</div>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">{stats.example}</div>
          <div className="text-sm text-amber-600">example.com</div>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.invalid}</div>
          <div className="text-sm text-orange-600">Formato inválido</div>
        </div>
      </div>

      {/* News Items Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900">
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Título</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-left">Fuente</th>
              <th className="px-4 py-2 text-left">Enlace</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {newsItems.map((item) => {
              const { icon: StatusIcon, color, status } = getLinkStatus(item.link);
              return (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${color}`} />
                      <span className={`text-sm ${color}`}>{status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="max-w-xs truncate" title={item.title}>
                      {item.title}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{item.source}</td>
                  <td className="px-4 py-2">
                    <div className="max-w-xs truncate text-sm font-mono" title={item.link || 'Sin enlace'}>
                      {item.link || <span className="text-gray-400 italic">Sin enlace</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {item.link && (item.link.startsWith('http://') || item.link.startsWith('https://')) && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Abrir</span>
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      {(stats.empty > 0 || stats.example > 0) && (
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Recomendaciones</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
            {stats.empty > 0 && (
              <li>Hay {stats.empty} artículos sin enlace. El sistema usará búsquedas de Google como fallback.</li>
            )}
            {stats.example > 0 && (
              <li>Hay {stats.example} artículos con enlaces a example.com. Estos deben ser actualizados con URLs reales.</li>
            )}
            <li>Los enlaces válidos deben comenzar con http:// o https://</li>
          </ul>
        </div>
      )}
    </div>
  );
}