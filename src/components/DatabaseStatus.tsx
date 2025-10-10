import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function DatabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [newsCount, setNewsCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const checkConnection = async () => {
    setLoading(true);
    try {
      // Contar noticias totales
      const { count, error } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      setIsConnected(true);
      setNewsCount(count || 0);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Database connection error:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Verificar cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
      isConnected === null 
        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
        : isConnected 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {loading ? (
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          ) : isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        
        <div className="text-sm">
          <div className="font-semibold text-gray-900 dark:text-white">
            {isConnected === null ? 'Verificando...' : isConnected ? 'Supabase Conectado' : 'Modo Offline'}
          </div>
          {isConnected && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {newsCount} noticias • Actualizado: {lastUpdate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}