-- Script definitivo para actualizar enlaces de noticias
-- Maneja restricciones NOT NULL y UNIQUE

-- Paso 1: Actualizar DIRECTAMENTE los enlaces vacíos o example.com con búsquedas de Google únicas
-- No usar NULL ya que la columna tiene restricción NOT NULL
UPDATE news 
SET link = 
    'https://www.google.com/search?q=' || 
    REPLACE(REPLACE(REPLACE(REPLACE(LOWER(title), ' ', '+'), '"', ''), '''', ''), ',', '') || 
    '+' || 
    REPLACE(LOWER(source), ' ', '+') ||
    '&btnI=1'
WHERE link = '' OR link LIKE '%example.com%';

-- Verificar si hay algunos enlaces NULL (por si acaso)
UPDATE news 
SET link = 
    'https://www.google.com/search?q=' || 
    REPLACE(REPLACE(REPLACE(REPLACE(LOWER(title), ' ', '+'), '"', ''), '''', ''), ',', '') || 
    '+' || 
    REPLACE(LOWER(source), ' ', '+')
WHERE link IS NULL;

-- Paso 2: Para mejorar la experiencia, actualizar algunos enlaces con búsquedas más específicas por sitio
UPDATE news 
SET link = 
    'https://www.google.com/search?q=' || 
    REPLACE(REPLACE(REPLACE(REPLACE(LOWER(title), ' ', '+'), '"', ''), '''', ''), ',', '') || 
    '+site:' || 
    CASE 
        WHEN source = 'The Hacker News' THEN 'thehackernews.com'
        WHEN source = 'Dark Reading' THEN 'darkreading.com'
        WHEN source = 'Bleeping Computer' THEN 'bleepingcomputer.com'
        WHEN source = 'CoinTelegraph' THEN 'cointelegraph.com'
        WHEN source = 'CoinDesk' THEN 'coindesk.com'
        WHEN source = 'AI News' THEN 'artificialintelligence-news.com'
        WHEN source = 'VentureBeat' THEN 'venturebeat.com'
        WHEN source = 'InfoQ' THEN 'infoq.com'
        WHEN source = 'DevOps.com' THEN 'devops.com'
        WHEN source = 'KDnuggets' THEN 'kdnuggets.com'
        WHEN source = 'IoT Analytics' THEN 'iot-analytics.com'
        WHEN source = 'The Quantum Insider' THEN 'thequantuminsider.com'
        WHEN source = 'Cloud Computing News' THEN 'cloudcomputing-news.net'
        ELSE REPLACE(REPLACE(LOWER(source), ' ', ''), '.', '') || '.com'
    END
WHERE link LIKE 'https://www.google.com/search%'
AND source IN (
    'The Hacker News', 'Dark Reading', 'Bleeping Computer',
    'CoinTelegraph', 'CoinDesk', 'AI News', 'VentureBeat',
    'InfoQ', 'DevOps.com', 'KDnuggets', 'IoT Analytics',
    'The Quantum Insider', 'Cloud Computing News'
);

-- Paso 3: Manejar posibles duplicados añadiendo el ID al final de la búsqueda
UPDATE news n1
SET link = link || '&id=' || n1.id
WHERE EXISTS (
    SELECT 1 
    FROM news n2 
    WHERE n1.link = n2.link 
    AND n1.id != n2.id
);

-- Verificar resultados
SELECT 
    category,
    COUNT(*) as total,
    COUNT(CASE WHEN link LIKE '%google.com%' THEN 1 END) as enlaces_google,
    COUNT(CASE WHEN link NOT LIKE '%google.com%' THEN 1 END) as enlaces_otros,
    COUNT(CASE WHEN link = '' OR link IS NULL THEN 1 END) as sin_enlace
FROM news
GROUP BY category
ORDER BY category;

-- Mostrar algunos ejemplos
SELECT 
    title,
    source,
    CASE 
        WHEN LENGTH(link) > 100 THEN SUBSTRING(link, 1, 97) || '...'
        ELSE link
    END as link_preview
FROM news
WHERE link LIKE '%google.com%'
LIMIT 10;