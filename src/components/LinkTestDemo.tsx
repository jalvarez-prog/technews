import React from 'react';
import { NewsCard } from './NewsCard';
import { testArticles } from '../utils/linkUtils.test';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Demo component to test and visualize the link handling implementation
 */
export function LinkTestDemo() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema de Enlaces Robusto - Demo de Prueba
          </h1>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Características implementadas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Validación automática de URLs</li>
                  <li>Enlaces de respaldo (Google Search) para URLs inválidas</li>
                  <li>Indicadores visuales para enlaces alternativos</li>
                  <li>Seguimiento de clics con analytics</li>
                  <li>Manejo de protocolos faltantes</li>
                  <li>Tooltips informativos con el dominio de destino</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Casos de Prueba
            </h2>
            
            {/* Legend */}
            <div className="flex items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">Enlace original válido</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-gray-600 dark:text-gray-400">Enlace de búsqueda alternativo</span>
              </div>
            </div>

            {/* Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testArticles.map((article) => (
                <div key={article.id}>
                  <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                    <p className="font-mono text-gray-600 dark:text-gray-400">
                      Link: {article.link || 'null'}
                    </p>
                  </div>
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Instrucciones de prueba:
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>Haz clic en cualquier tarjeta para probar la navegación</li>
              <li>Observa los indicadores visuales en las tarjetas con enlaces alternativos</li>
              <li>Abre la consola del navegador para ver el tracking de analytics</li>
              <li>Pasa el cursor sobre los enlaces para ver los tooltips con información del dominio</li>
              <li>Los enlaces con ⚠️ abrirán una búsqueda en Google del artículo</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}