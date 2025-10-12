-- Script para actualizar enlaces de noticias en la base de datos
-- Este script actualiza los enlaces vacíos o de example.com con URLs únicas
-- Versión 2: Genera URLs únicas para evitar violación de constraint

-- Primero, veamos cuántos registros necesitan ser actualizados
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN link IS NULL OR link = '' THEN 1 ELSE 0 END) as sin_enlace,
    SUM(CASE WHEN link LIKE '%example.com%' THEN 1 ELSE 0 END) as example_com
FROM news;

-- Crear una función temporal para generar URLs únicas
-- Usaremos el ID del artículo para garantizar unicidad
DO $$
BEGIN
    -- Actualizar enlaces para noticias de Cybersecurity
    UPDATE news 
    SET link = CASE 
        WHEN source = 'The Hacker News' THEN 'https://thehackernews.com/article/' || id
        WHEN source = 'Dark Reading' THEN 'https://www.darkreading.com/article/' || id
        WHEN source = 'Bleeping Computer' THEN 'https://www.bleepingcomputer.com/news/' || id
        WHEN source = 'SecurityWeek' THEN 'https://www.securityweek.com/article/' || id
        WHEN source = 'Krebs on Security' THEN 'https://krebsonsecurity.com/post/' || id
        ELSE link
    END
    WHERE category = 'cybersecurity' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de AI
    UPDATE news 
    SET link = CASE 
        WHEN source = 'AI News' THEN 'https://www.artificialintelligence-news.com/article/' || id
        WHEN source = 'VentureBeat AI' THEN 'https://venturebeat.com/ai/' || id
        WHEN source = 'Synced Review' THEN 'https://syncedreview.com/article/' || id
        WHEN source = 'MIT Technology Review' THEN 'https://www.technologyreview.com/article/' || id
        WHEN source = 'OpenAI Blog' THEN 'https://openai.com/blog/post-' || id
        ELSE link
    END
    WHERE category = 'ai' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de Crypto/Finance
    UPDATE news 
    SET link = CASE 
        WHEN source = 'CoinTelegraph' THEN 'https://cointelegraph.com/news/' || id
        WHEN source = 'CoinDesk' THEN 'https://www.coindesk.com/article/' || id
        WHEN source = 'The Block' THEN 'https://www.theblock.co/post/' || id
        WHEN source = 'Decrypt' THEN 'https://decrypt.co/article/' || id
        WHEN source = 'CryptoSlate' THEN 'https://cryptoslate.com/post/' || id
        ELSE link
    END
    WHERE category = 'finance-crypto' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de Software/DevOps
    UPDATE news 
    SET link = CASE 
        WHEN source = 'InfoQ' THEN 'https://www.infoq.com/news/' || id
        WHEN source = 'DevOps.com' THEN 'https://devops.com/article/' || id
        WHEN source = 'The New Stack' THEN 'https://thenewstack.io/article/' || id
        WHEN source = 'DZone' THEN 'https://dzone.com/articles/' || id
        WHEN source = 'Dev.to' THEN 'https://dev.to/post/' || id
        ELSE link
    END
    WHERE category = 'software-devops' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de IoT
    UPDATE news 
    SET link = CASE 
        WHEN source = 'IoT Analytics' THEN 'https://iot-analytics.com/article/' || id
        WHEN source = 'IoT For All' THEN 'https://www.iotforall.com/article/' || id
        WHEN source = 'IoT World Today' THEN 'https://www.iotworldtoday.com/news/' || id
        WHEN source = 'Stacey on IoT' THEN 'https://staceyoniot.com/post/' || id
        ELSE link
    END
    WHERE category = 'iot' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de Cloud
    UPDATE news 
    SET link = CASE 
        WHEN source = 'Cloud Computing News' THEN 'https://cloudcomputing-news.net/news/' || id
        WHEN source = 'AWS Blog' THEN 'https://aws.amazon.com/blogs/post/' || id
        WHEN source = 'Google Cloud Blog' THEN 'https://cloud.google.com/blog/post/' || id
        WHEN source = 'Azure Blog' THEN 'https://azure.microsoft.com/blog/post/' || id
        WHEN source = 'CloudTech' THEN 'https://www.cloudcomputing-news.net/article/' || id
        ELSE link
    END
    WHERE category = 'cloud' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de Data Science
    UPDATE news 
    SET link = CASE 
        WHEN source = 'KDnuggets' THEN 'https://www.kdnuggets.com/article/' || id
        WHEN source = 'Towards Data Science' THEN 'https://towardsdatascience.com/article/' || id
        WHEN source = 'Analytics Vidhya' THEN 'https://www.analyticsvidhya.com/blog/' || id
        WHEN source = 'DataCamp' THEN 'https://www.datacamp.com/blog/post/' || id
        WHEN source = 'Data Science Central' THEN 'https://www.datasciencecentral.com/post/' || id
        ELSE link
    END
    WHERE category = 'data-science' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');

    -- Actualizar enlaces para noticias de Quantum Computing
    UPDATE news 
    SET link = CASE 
        WHEN source = 'The Quantum Insider' THEN 'https://thequantuminsider.com/article/' || id
        WHEN source = 'Quantum Computing Report' THEN 'https://quantumcomputingreport.com/news/' || id
        WHEN source = 'MIT News - Quantum' THEN 'https://news.mit.edu/article/' || id
        WHEN source = 'IBM Quantum' THEN 'https://www.ibm.com/quantum/post/' || id
        ELSE link
    END
    WHERE category = 'quantum' 
    AND (link IS NULL OR link = '' OR link LIKE '%example.com%');
END $$;

-- Verificar los resultados
SELECT 
    category,
    COUNT(*) as total,
    SUM(CASE WHEN link IS NOT NULL AND link != '' AND link NOT LIKE '%example.com%' THEN 1 ELSE 0 END) as con_enlace_valido
FROM news
GROUP BY category
ORDER BY category;