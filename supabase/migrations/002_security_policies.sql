-- =============================================
-- SECURITY POLICIES - Row Level Security (RLS)
-- Version: 1.0.0
-- Date: 2025-01-09
-- Description: Políticas de seguridad para el acceso a datos
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_updates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA LA TABLA 'news'
-- =============================================

-- Política: Lectura pública de noticias
CREATE POLICY "Lectura pública de noticias" ON news
    FOR SELECT
    USING (true);

-- Política: Solo service_role puede insertar noticias
CREATE POLICY "Insertar noticias - solo service role" ON news
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Política: Solo service_role puede actualizar noticias
CREATE POLICY "Actualizar noticias - solo service role" ON news
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política: Solo service_role puede eliminar noticias
CREATE POLICY "Eliminar noticias - solo service role" ON news
    FOR DELETE
    TO service_role
    USING (true);

-- Política: Incremento de view_count permitido para usuarios anónimos
CREATE POLICY "Incrementar view_count - público" ON news
    FOR UPDATE
    USING (true)
    WITH CHECK (
        -- Solo permitir actualizar view_count
        id = id AND
        title = title AND
        description = description AND
        link = link AND
        pub_date = pub_date AND
        source = source AND
        category = category AND
        view_count = view_count + 1
    );

-- =============================================
-- POLÍTICAS PARA LA TABLA 'ticker_stats'
-- =============================================

-- Política: Lectura pública de ticker_stats
CREATE POLICY "Lectura pública de ticker_stats" ON ticker_stats
    FOR SELECT
    USING (true);

-- Política: Solo service_role puede gestionar ticker_stats
CREATE POLICY "Gestión ticker_stats - solo service role" ON ticker_stats
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================
-- POLÍTICAS PARA LA TABLA 'feed_updates'
-- =============================================

-- Política: Solo service_role puede ver feed_updates
CREATE POLICY "Ver feed_updates - solo service role" ON feed_updates
    FOR SELECT
    TO service_role
    USING (true);

-- Política: Solo service_role puede gestionar feed_updates
CREATE POLICY "Gestión feed_updates - solo service role" ON feed_updates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================
-- FUNCIONES DE API PÚBLICA
-- =============================================

-- Función pública para obtener noticias recientes
CREATE OR REPLACE FUNCTION public.get_recent_news(
    p_limit INTEGER DEFAULT 20
)
RETURNS SETOF news_formatted
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM news_formatted
    ORDER BY pub_date DESC
    LIMIT p_limit;
$$;

-- Función pública para obtener noticias del ticker
CREATE OR REPLACE FUNCTION public.get_ticker_news(
    p_category text DEFAULT NULL
)
RETURNS SETOF ticker_news
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM ticker_news
    WHERE (p_category IS NULL OR category = p_category)
    ORDER BY pub_date DESC
    LIMIT 10;
$$;

-- Función pública para buscar noticias
CREATE OR REPLACE FUNCTION public.search_news(
    search_query TEXT,
    p_category text DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    description TEXT,
    link TEXT,
    pub_date TIMESTAMPTZ,
    source VARCHAR(255),
    category TEXT,
    image_url TEXT,
    relevance REAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        n.image_url,
        ts_rank(
            to_tsvector('spanish', n.title || ' ' || n.description),
            plainto_tsquery('spanish', search_query)
        ) as relevance
    FROM news n
    WHERE 
        (p_category IS NULL OR n.category::text = p_category)
        AND (
            n.title ILIKE '%' || search_query || '%'
            OR n.description ILIKE '%' || search_query || '%'
            OR n.source ILIKE '%' || search_query || '%'
        )
    ORDER BY relevance DESC, n.pub_date DESC
    LIMIT p_limit;
END;
$$;

-- Función para incrementar view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(p_news_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE news 
    SET view_count = view_count + 1
    WHERE id = p_news_id;
END;
$$;

-- =============================================
-- ROLES Y PERMISOS
-- =============================================

-- Crear rol para el scraper/backend si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'news_scraper') THEN
        CREATE ROLE news_scraper WITH LOGIN PASSWORD 'secure_password_here';
    END IF;
END $$;

-- Otorgar permisos al rol news_scraper
GRANT USAGE ON SCHEMA public TO news_scraper;
GRANT SELECT, INSERT, UPDATE ON news TO news_scraper;
GRANT SELECT, INSERT, UPDATE ON feed_updates TO news_scraper;
GRANT SELECT ON ticker_stats TO news_scraper;
GRANT EXECUTE ON FUNCTION insert_news_safe TO news_scraper;
GRANT EXECUTE ON FUNCTION cleanup_old_news TO news_scraper;

-- =============================================
-- CONFIGURACIÓN DE RATE LIMITING
-- =============================================

-- Nota: El rate limiting en Supabase se configura a través del dashboard
-- o usando la extensión pg_rate_limit si está disponible

-- Crear tabla para tracking de requests (opcional)
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET,
    endpoint TEXT,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para rate limiting
CREATE INDEX idx_rate_limit_ip_endpoint ON api_rate_limits(ip_address, endpoint, window_start);

-- Función para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address INET,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 100,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Contar requests en la ventana actual
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM api_rate_limits
    WHERE ip_address = p_ip_address
        AND endpoint = p_endpoint
        AND window_start >= window_start;
    
    -- Verificar si excede el límite
    IF current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;
    
    -- Registrar el nuevo request
    INSERT INTO api_rate_limits (ip_address, endpoint)
    VALUES (p_ip_address, p_endpoint);
    
    -- Limpiar registros antiguos
    DELETE FROM api_rate_limits
    WHERE window_start < NOW() - INTERVAL '1 hour';
    
    RETURN TRUE;
END;
$$;

-- =============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON POLICY "Lectura pública de noticias" ON news 
    IS 'Permite lectura pública de todas las noticias';

COMMENT ON POLICY "Insertar noticias - solo service role" ON news 
    IS 'Solo el backend con service_role puede insertar noticias';

COMMENT ON FUNCTION public.get_recent_news(INTEGER) 
    IS 'Obtiene las noticias más recientes con límite configurable';

COMMENT ON FUNCTION public.get_ticker_news(text) 
    IS 'Obtiene noticias destacadas para el ticker, opcionalmente filtradas por categoría';

COMMENT ON FUNCTION public.search_news(TEXT, text, INTEGER) 
    IS 'Búsqueda de texto completo en noticias con ranking de relevancia';

COMMENT ON FUNCTION check_rate_limit(INET, TEXT, INTEGER, INTEGER) 
    IS 'Verifica y aplica rate limiting por IP y endpoint';