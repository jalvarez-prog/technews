-- Script para actualizar enlaces eliminando temporalmente la restricción
-- ADVERTENCIA: Este script modifica la estructura de la tabla temporalmente

-- 1. Primero, verificar el nombre exacto de la restricción
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'news'::regclass 
AND contype = 'u';

-- 2. Eliminar la restricción de unicidad (ajustar el nombre si es diferente)
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_link_key;

-- 3. Actualizar los enlaces vacíos o de example.com con URLs de las fuentes principales
UPDATE news 
SET link = CASE 
    -- Cybersecurity
    WHEN category = 'cybersecurity' AND source = 'The Hacker News' THEN 'https://thehackernews.com/'
    WHEN category = 'cybersecurity' AND source = 'Dark Reading' THEN 'https://www.darkreading.com/'
    WHEN category = 'cybersecurity' AND source = 'Bleeping Computer' THEN 'https://www.bleepingcomputer.com/'
    WHEN category = 'cybersecurity' THEN 'https://www.cybersecurity-news.com/'
    
    -- AI
    WHEN category = 'ai' AND source = 'AI News' THEN 'https://www.artificialintelligence-news.com/'
    WHEN category = 'ai' AND source = 'VentureBeat' THEN 'https://venturebeat.com/ai/'
    WHEN category = 'ai' AND source = 'Synced Review' THEN 'https://syncedreview.com/'
    WHEN category = 'ai' THEN 'https://www.aitrends.com/'
    
    -- Finance/Crypto
    WHEN category = 'finance-crypto' AND source = 'CoinTelegraph' THEN 'https://cointelegraph.com/'
    WHEN category = 'finance-crypto' AND source = 'CoinDesk' THEN 'https://www.coindesk.com/'
    WHEN category = 'finance-crypto' AND source = 'The Block' THEN 'https://www.theblock.co/'
    WHEN category = 'finance-crypto' THEN 'https://cryptonews.com/'
    
    -- Software/DevOps
    WHEN category = 'software-devops' AND source = 'InfoQ' THEN 'https://www.infoq.com/'
    WHEN category = 'software-devops' AND source = 'DevOps.com' THEN 'https://devops.com/'
    WHEN category = 'software-devops' THEN 'https://thenewstack.io/'
    
    -- IoT
    WHEN category = 'iot' AND source = 'IoT Analytics' THEN 'https://iot-analytics.com/'
    WHEN category = 'iot' AND source = 'IoT For All' THEN 'https://www.iotforall.com/'
    WHEN category = 'iot' THEN 'https://www.iotworldtoday.com/'
    
    -- Cloud
    WHEN category = 'cloud' AND source = 'Cloud Computing News' THEN 'https://cloudcomputing-news.net/'
    WHEN category = 'cloud' AND source LIKE '%AWS%' THEN 'https://aws.amazon.com/blogs/'
    WHEN category = 'cloud' THEN 'https://cloud.google.com/blog/'
    
    -- Data Science
    WHEN category = 'data-science' AND source = 'KDnuggets' THEN 'https://www.kdnuggets.com/'
    WHEN category = 'data-science' AND source = 'Towards Data Science' THEN 'https://towardsdatascience.com/'
    WHEN category = 'data-science' THEN 'https://www.datasciencecentral.com/'
    
    -- Quantum
    WHEN category = 'quantum' AND source = 'The Quantum Insider' THEN 'https://thequantuminsider.com/'
    WHEN category = 'quantum' THEN 'https://quantumcomputingreport.com/'
    
    -- Default: usar NULL para que el sistema use el fallback de Google
    ELSE NULL
END
WHERE link = '' OR link LIKE '%example.com%' OR link IS NULL;

-- 4. Para los que aún son NULL o duplicados, usar búsqueda de Google personalizada
UPDATE news 
SET link = 'https://www.google.com/search?q=' || 
           REPLACE(REPLACE(REPLACE(LOWER(title), ' ', '+'), '"', ''), '''', '') || 
           '+site:' || 
           CASE 
               WHEN source = 'The Hacker News' THEN 'thehackernews.com'
               WHEN source = 'CoinTelegraph' THEN 'cointelegraph.com'
               WHEN source = 'InfoQ' THEN 'infoq.com'
               WHEN source = 'KDnuggets' THEN 'kdnuggets.com'
               ELSE REPLACE(LOWER(source), ' ', '')
           END
WHERE link IS NULL OR link IN (
    SELECT link 
    FROM news 
    GROUP BY link 
    HAVING COUNT(*) > 1
);

-- 5. Verificar que no hay duplicados
SELECT link, COUNT(*) as count
FROM news
WHERE link IS NOT NULL
GROUP BY link
HAVING COUNT(*) > 1;

-- 6. Si no hay duplicados, podemos recrear la restricción (opcional)
-- ALTER TABLE news ADD CONSTRAINT news_link_key UNIQUE (link);

-- 7. Mostrar estadísticas finales
SELECT 
    category,
    COUNT(*) as total,
    COUNT(link) as con_enlace,
    COUNT(CASE WHEN link LIKE '%google.com%' THEN 1 END) as enlaces_google,
    COUNT(CASE WHEN link NOT LIKE '%google.com%' AND link IS NOT NULL THEN 1 END) as enlaces_directos
FROM news
GROUP BY category
ORDER BY category;