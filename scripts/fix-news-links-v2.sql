-- Script alternativo para actualizar enlaces de noticias
-- Versión 2: Maneja la restricción de unicidad correctamente

-- Opción 1: Usar NULL temporalmente para enlaces vacíos
-- (NULL no viola la restricción de unicidad en PostgreSQL)

-- Primero, establecer NULL en enlaces vacíos o example.com
UPDATE news 
SET link = NULL
WHERE link = '' OR link LIKE '%example.com%';

-- Ahora actualizar con URLs únicas usando una búsqueda en Google personalizada
-- Esto garantiza que cada artículo tenga un enlace único y funcional
UPDATE news 
SET link = 'https://www.google.com/search?q=' || 
           REPLACE(REPLACE(REPLACE(LOWER(title), ' ', '+'), '"', ''), '''', '') || 
           '+' || 
           REPLACE(LOWER(source), ' ', '+') ||
           '&btnI=1'
WHERE link IS NULL;

-- Verificar los resultados
SELECT 
    category,
    COUNT(*) as total,
    COUNT(link) as con_enlace,
    COUNT(*) - COUNT(link) as sin_enlace
FROM news
GROUP BY category
ORDER BY category;

-- Mostrar algunos ejemplos de los nuevos enlaces
SELECT 
    title,
    source,
    category,
    link
FROM news
WHERE link LIKE '%google.com/search%'
LIMIT 10;