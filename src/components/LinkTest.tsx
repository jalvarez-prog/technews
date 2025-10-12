import React from 'react';

export function LinkTest() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Prueba de Enlaces</h2>
      
      <div className="space-y-2">
        <p>Enlaces de prueba directos:</p>
        
        <a 
          href="https://www.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block text-blue-600 hover:underline"
        >
          1. Enlace simple a Google (sin tracking)
        </a>
        
        <a 
          href="https://www.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => console.log('Click logged')}
          className="block text-blue-600 hover:underline"
        >
          2. Enlace con console.log
        </a>
        
        <a 
          href="https://www.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => {
            console.log('Click with event:', e);
            // NO preventDefault
          }}
          className="block text-blue-600 hover:underline"
        >
          3. Enlace con event handler (sin preventDefault)
        </a>
      </div>
    </div>
  );
}