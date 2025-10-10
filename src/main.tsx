import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { verifyDatabaseConnection } from './utils/verifyDatabase';

// Hacer la función disponible globalmente
if (typeof window !== 'undefined') {
  (window as any).verifyDatabase = verifyDatabaseConnection;
  console.log('🚀 TechHub News - Base de datos conectada');
  console.log('💡 Escribe verifyDatabase() en la consola para verificar la conexión');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
