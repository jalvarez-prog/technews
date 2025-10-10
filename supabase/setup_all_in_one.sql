-- =============================================
-- TECHHUB NEWS - SETUP COMPLETO
-- Ejecuta este script en el SQL Editor de Supabase
-- =============================================

-- PARTE 1: ESQUEMA PRINCIPAL
-- =============================================

-- Crear enum para categorías
CREATE TYPE news_category AS ENUM (
    'cybersecurity',
    'ai',
    'finance-crypto',
    'software-devops',
    'iot',
    'cloud',
    'data-science',
    'quantum'
);

-- Crear enum para severidad
CREATE TYPE news_severity AS ENUM (
    'critical',
    'high',
    'medium',
    'low',
    'hot',
    'trending'
);

-- Tabla principal de noticias
CREATE TABLE IF NOT EXISTS news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(255) NOT NULL,
    category news_category NOT NULL,
    image_url TEXT,
    content TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    severity news_severity DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimización
CREATE INDEX idx_news_category_pubdate ON news(category, pub_date DESC);
CREATE INDEX idx_news_featured ON news(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_news_pubdate ON news(pub_date DESC);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PARTE 2: POLÍTICAS DE SEGURIDAD
-- =============================================

-- Habilitar RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública
CREATE POLICY "Lectura pública de noticias" ON news
    FOR SELECT
    USING (true);

-- Política: Solo service_role puede insertar
CREATE POLICY "Insertar noticias - solo service role" ON news
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Política: Solo service_role puede actualizar
CREATE POLICY "Actualizar noticias - solo service role" ON news
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política: Solo service_role puede eliminar
CREATE POLICY "Eliminar noticias - solo service role" ON news
    FOR DELETE
    TO service_role
    USING (true);

-- PARTE 3: FUNCIONES ÚTILES
-- =============================================

-- Función para insertar noticias de forma segura
CREATE OR REPLACE FUNCTION insert_news_safe(
    p_title VARCHAR(500),
    p_description TEXT,
    p_link TEXT,
    p_pub_date TIMESTAMPTZ,
    p_source VARCHAR(255),
    p_category news_category,
    p_image_url TEXT DEFAULT NULL,
    p_content TEXT DEFAULT NULL,
    p_is_featured BOOLEAN DEFAULT FALSE,
    p_severity news_severity DEFAULT 'medium',
    p_tags TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO news (
        title, description, link, pub_date, source, category,
        image_url, content, is_featured, severity, tags
    )
    VALUES (
        p_title, p_description, p_link, p_pub_date, p_source, p_category,
        p_image_url, p_content, p_is_featured, p_severity, p_tags
    )
    ON CONFLICT (link) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        pub_date = EXCLUDED.pub_date,
        updated_at = NOW()
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener noticias por categoría
CREATE OR REPLACE FUNCTION get_news_by_category(
    p_category news_category,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    description TEXT,
    link TEXT,
    pub_date TIMESTAMPTZ,
    source VARCHAR(255),
    category TEXT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.link,
        n.pub_date,
        n.source,
        n.category::text,
        n.image_url
    FROM news n
    WHERE n.category = p_category
    ORDER BY n.pub_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- PARTE 4: DATOS DE PRUEBA
-- =============================================

-- Insertar noticias de ejemplo para cada categoría
DO $$
BEGIN
    -- Cybersecurity
    PERFORM insert_news_safe(
        'Nueva vulnerabilidad crítica descubierta en sistemas Windows',
        'Microsoft ha lanzado un parche de emergencia para corregir una vulnerabilidad de día cero que afecta a todas las versiones de Windows.',
        'https://example.com/windows-vulnerability-' || gen_random_uuid(),
        NOW() - INTERVAL '2 hours',
        'The Hacker News',
        'cybersecurity',
        'https://picsum.photos/800/400?random=1',
        NULL,
        TRUE,
        'critical',
        ARRAY['security', 'windows', 'vulnerability']
    );

    -- AI
    PERFORM insert_news_safe(
        'OpenAI lanza GPT-5: El modelo más avanzado hasta la fecha',
        'La nueva versión promete capacidades de razonamiento mejoradas y mayor comprensión del contexto.',
        'https://example.com/openai-gpt5-' || gen_random_uuid(),
        NOW() - INTERVAL '3 hours',
        'AI News',
        'ai',
        'https://picsum.photos/800/400?random=2',
        NULL,
        TRUE,
        'hot',
        ARRAY['ai', 'openai', 'gpt5']
    );

    -- Finance-Crypto
    PERFORM insert_news_safe(
        'Bitcoin alcanza nuevo máximo histórico superando los $100,000',
        'La criptomoneda líder rompe barreras mientras la adopción institucional continúa creciendo.',
        'https://example.com/bitcoin-ath-' || gen_random_uuid(),
        NOW() - INTERVAL '4 hours',
        'CoinTelegraph',
        'finance-crypto',
        'https://picsum.photos/800/400?random=3',
        NULL,
        TRUE,
        'hot',
        ARRAY['bitcoin', 'crypto', 'ath']
    );

    -- Software-DevOps
    PERFORM insert_news_safe(
        'Kubernetes 2.0: Nueva versión con características revolucionarias',
        'La comunidad de Kubernetes lanza una actualización mayor con mejoras significativas en seguridad y rendimiento.',
        'https://example.com/kubernetes-2-' || gen_random_uuid(),
        NOW() - INTERVAL '5 hours',
        'InfoQ',
        'software-devops',
        'https://picsum.photos/800/400?random=4',
        NULL,
        FALSE,
        'trending',
        ARRAY['kubernetes', 'devops', 'containers']
    );

    -- IoT
    PERFORM insert_news_safe(
        'Matter 2.0: El estándar que unificará todos los dispositivos IoT',
        'La nueva versión del protocolo promete compatibilidad universal entre todos los dispositivos inteligentes del hogar.',
        'https://example.com/matter-2-' || gen_random_uuid(),
        NOW() - INTERVAL '6 hours',
        'IoT Analytics',
        'iot',
        'https://picsum.photos/800/400?random=5',
        NULL,
        FALSE,
        'medium',
        ARRAY['iot', 'matter', 'smart-home']
    );

    -- Cloud
    PERFORM insert_news_safe(
        'AWS lanza servicios de computación cuántica en la nube',
        'Amazon Web Services hace accesible la computación cuántica a desarrolladores de todo el mundo.',
        'https://example.com/aws-quantum-' || gen_random_uuid(),
        NOW() - INTERVAL '7 hours',
        'Cloud Computing News',
        'cloud',
        'https://picsum.photos/800/400?random=6',
        NULL,
        TRUE,
        'trending',
        ARRAY['aws', 'cloud', 'quantum']
    );

    -- Data Science
    PERFORM insert_news_safe(
        'AutoML democratiza el machine learning para todos',
        'Las plataformas de AutoML permiten a no expertos crear modelos de ML sofisticados.',
        'https://example.com/automl-' || gen_random_uuid(),
        NOW() - INTERVAL '8 hours',
        'KDnuggets',
        'data-science',
        'https://picsum.photos/800/400?random=7',
        NULL,
        FALSE,
        'medium',
        ARRAY['automl', 'machine-learning', 'data-science']
    );

    -- Quantum
    PERFORM insert_news_safe(
        'IBM alcanza 1000 qubits con su nuevo procesador cuántico',
        'El hito marca el comienzo de la era de la computación cuántica práctica.',
        'https://example.com/ibm-quantum-' || gen_random_uuid(),
        NOW() - INTERVAL '9 hours',
        'The Quantum Insider',
        'quantum',
        'https://picsum.photos/800/400?random=8',
        NULL,
        TRUE,
        'hot',
        ARRAY['quantum', 'ibm', 'qubits']
    );

    -- Más noticias para llenar
    FOR i IN 1..5 LOOP
        -- Cybersecurity adicionales
        PERFORM insert_news_safe(
            'Noticia de Ciberseguridad #' || i,
            'Descripción de la noticia de ciberseguridad número ' || i || '.',
            'https://example.com/cyber-' || i || '-' || gen_random_uuid(),
            NOW() - INTERVAL '1 day' * i,
            'Security Source',
            'cybersecurity',
            'https://picsum.photos/800/400?random=' || (10 + i),
            NULL,
            FALSE,
            'medium',
            ARRAY['security', 'news']
        );

        -- AI adicionales
        PERFORM insert_news_safe(
            'Avance en Inteligencia Artificial #' || i,
            'Nueva investigación en IA muestra resultados prometedores en el área ' || i || '.',
            'https://example.com/ai-' || i || '-' || gen_random_uuid(),
            NOW() - INTERVAL '1 day' * i - INTERVAL '2 hours',
            'AI Research',
            'ai',
            'https://picsum.photos/800/400?random=' || (20 + i),
            NULL,
            FALSE,
            'medium',
            ARRAY['ai', 'research']
        );
    END LOOP;
END $$;

-- PARTE 5: VERIFICACIÓN
-- =============================================

-- Verificar que todo se creó correctamente
DO $$
DECLARE
    total_news INTEGER;
    categories_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_news FROM news;
    SELECT COUNT(DISTINCT category) INTO categories_count FROM news;
    
    RAISE NOTICE '✅ Setup completado exitosamente!';
    RAISE NOTICE '📊 Total de noticias creadas: %', total_news;
    RAISE NOTICE '📁 Categorías con datos: %', categories_count;
    RAISE NOTICE '🚀 Tu backend está listo para usar!';
END $$;

-- Ver resumen de noticias por categoría
SELECT 
    category::text as "Categoría",
    COUNT(*) as "Total Noticias",
    COUNT(*) FILTER (WHERE is_featured = TRUE) as "Destacadas",
    MAX(pub_date) as "Más Reciente"
FROM news
GROUP BY category
ORDER BY COUNT(*) DESC;