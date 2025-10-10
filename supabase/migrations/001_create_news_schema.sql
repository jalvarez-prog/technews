-- =============================================
-- TECHHUB NEWS DATABASE SCHEMA
-- Version: 1.0.0
-- Date: 2025-01-09
-- Description: Esquema principal para el sistema de noticias TechHub
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

-- Crear enum para severidad (usado en ticker)
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
    -- Identificador único
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Campos obligatorios
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(255) NOT NULL,
    category news_category NOT NULL,
    
    -- Campos opcionales
    image_url TEXT,
    content TEXT,
    
    -- Campos para el ticker
    is_featured BOOLEAN DEFAULT FALSE,
    severity news_severity DEFAULT 'medium',
    
    -- Campos adicionales
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps del sistema
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT title_not_empty CHECK (char_length(title) > 0),
    CONSTRAINT description_not_empty CHECK (char_length(description) > 0),
    CONSTRAINT valid_link CHECK (link ~ '^https?://')
);

-- Índices para optimización de queries
CREATE INDEX idx_news_category_pubdate ON news(category, pub_date DESC);
CREATE INDEX idx_news_featured ON news(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_news_pubdate ON news(pub_date DESC);
CREATE INDEX idx_news_source ON news(source);
CREATE INDEX idx_news_severity ON news(severity) WHERE is_featured = TRUE;
CREATE INDEX idx_news_tags ON news USING GIN(tags);

-- Tabla para estadísticas del ticker
CREATE TABLE IF NOT EXISTS ticker_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category news_category NOT NULL,
    sub_category VARCHAR(100),
    icon VARCHAR(10),
    custom_time VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para trackear actualizaciones de feeds RSS
CREATE TABLE IF NOT EXISTS feed_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feed_url TEXT NOT NULL,
    category news_category NOT NULL,
    last_fetched TIMESTAMPTZ,
    last_successful TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_updates_updated_at BEFORE UPDATE ON feed_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular tiempo relativo (similar al frontend)
CREATE OR REPLACE FUNCTION time_ago(timestamp_input TIMESTAMPTZ)
RETURNS TEXT AS $$
DECLARE
    seconds INTEGER;
    minutes INTEGER;
    hours INTEGER;
    days INTEGER;
BEGIN
    seconds := EXTRACT(EPOCH FROM (NOW() - timestamp_input))::INTEGER;
    
    IF seconds < 60 THEN
        RETURN 'Hace un momento';
    ELSIF seconds < 3600 THEN
        minutes := seconds / 60;
        RETURN 'Hace ' || minutes || ' minutos';
    ELSIF seconds < 86400 THEN
        hours := seconds / 3600;
        RETURN 'Hace ' || hours || ' horas';
    ELSE
        days := seconds / 86400;
        RETURN 'Hace ' || days || ' días';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vista para noticias con formato completo
CREATE OR REPLACE VIEW news_formatted AS
SELECT 
    id,
    title,
    description,
    link,
    pub_date,
    source,
    category::text,
    image_url,
    content,
    is_featured,
    severity::text,
    tags,
    time_ago(pub_date) as time_ago,
    view_count,
    created_at,
    updated_at
FROM news
WHERE pub_date > NOW() - INTERVAL '60 days';

-- Vista para el ticker de noticias
CREATE OR REPLACE VIEW ticker_news AS
SELECT 
    n.id,
    n.title,
    n.category::text,
    n.severity::text,
    n.source,
    time_ago(n.pub_date) as time,
    COALESCE(ts.icon, 
        CASE n.severity
            WHEN 'critical' THEN '🔴'
            WHEN 'high' THEN '⚠️'
            WHEN 'medium' THEN '🔹'
            WHEN 'hot' THEN '🔥'
            WHEN 'trending' THEN '📈'
            ELSE '📰'
        END
    ) as icon
FROM news n
LEFT JOIN ticker_stats ts ON ts.category = n.category
WHERE n.is_featured = TRUE
    AND n.pub_date > NOW() - INTERVAL '24 hours'
ORDER BY n.pub_date DESC;

-- Función para limpieza automática de noticias antiguas
CREATE OR REPLACE FUNCTION cleanup_old_news()
RETURNS void AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar noticias no destacadas más antiguas de 60 días
    DELETE FROM news 
    WHERE pub_date < NOW() - INTERVAL '60 days'
        AND is_featured = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de la operación (opcional, requiere tabla de logs)
    RAISE NOTICE 'Limpieza completada: % noticias eliminadas', deleted_count;
    
    -- Mantener solo las últimas 100 noticias por categoría
    WITH ranked_news AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY category ORDER BY pub_date DESC) as rn
        FROM news
        WHERE is_featured = FALSE
    )
    DELETE FROM news
    WHERE id IN (
        SELECT id FROM ranked_news WHERE rn > 100
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener noticias por categoría con paginación
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
    image_url TEXT,
    time_ago TEXT
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
        n.image_url,
        time_ago(n.pub_date)
    FROM news n
    WHERE n.category = p_category
    ORDER BY n.pub_date DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar noticias evitando duplicados
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
    -- Intentar insertar, si ya existe el link, actualizar algunos campos
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
        image_url = COALESCE(EXCLUDED.image_url, news.image_url),
        content = COALESCE(EXCLUDED.content, news.content),
        is_featured = EXCLUDED.is_featured OR news.is_featured,
        severity = CASE 
            WHEN EXCLUDED.severity = 'critical' THEN EXCLUDED.severity
            WHEN news.severity = 'critical' THEN news.severity
            ELSE EXCLUDED.severity
        END,
        tags = array_cat(news.tags, EXCLUDED.tags),
        updated_at = NOW()
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Comentarios de documentación
COMMENT ON TABLE news IS 'Tabla principal de noticias del TechHub';
COMMENT ON COLUMN news.is_featured IS 'Indica si la noticia debe aparecer en el ticker';
COMMENT ON COLUMN news.severity IS 'Nivel de importancia/urgencia de la noticia';
COMMENT ON COLUMN news.tags IS 'Array de etiquetas para búsqueda y categorización adicional';
COMMENT ON FUNCTION cleanup_old_news() IS 'Limpia noticias antiguas. Debe ejecutarse diariamente via cron job de Supabase';
COMMENT ON FUNCTION insert_news_safe(VARCHAR, TEXT, TEXT, TIMESTAMPTZ, VARCHAR, news_category, TEXT, TEXT, BOOLEAN, news_severity, TEXT[]) 
    IS 'Inserta noticias de forma segura, evitando duplicados y actualizando si ya existe';