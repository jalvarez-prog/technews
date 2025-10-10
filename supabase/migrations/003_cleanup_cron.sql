-- =============================================
-- AUTOMATIC CLEANUP CONFIGURATION
-- Version: 1.0.0
-- Date: 2025-01-09
-- Description: Configuración de limpieza automática de datos
-- =============================================

-- Nota: Supabase usa pg_cron para programar tareas
-- Esta extensión debe estar habilitada en tu proyecto de Supabase

-- Habilitar la extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================
-- FUNCIÓN DE LIMPIEZA MEJORADA
-- =============================================

-- Función mejorada de limpieza con logging
CREATE OR REPLACE FUNCTION cleanup_old_news_with_logging()
RETURNS TABLE (
    operation TEXT,
    affected_rows INTEGER,
    details JSONB
) AS $$
DECLARE
    deleted_old_news INTEGER;
    deleted_excess_news INTEGER;
    category_record RECORD;
    category_details JSONB = '[]'::JSONB;
BEGIN
    -- Inicializar tabla temporal para resultados
    CREATE TEMP TABLE IF NOT EXISTS cleanup_results (
        operation TEXT,
        affected_rows INTEGER,
        details JSONB
    ) ON COMMIT DROP;
    
    -- 1. Eliminar noticias no destacadas más antiguas de 60 días
    DELETE FROM news 
    WHERE pub_date < NOW() - INTERVAL '60 days'
        AND is_featured = FALSE;
    
    GET DIAGNOSTICS deleted_old_news = ROW_COUNT;
    
    INSERT INTO cleanup_results VALUES (
        'Eliminación por antigüedad (>60 días)',
        deleted_old_news,
        jsonb_build_object(
            'cutoff_date', (NOW() - INTERVAL '60 days')::date,
            'featured_excluded', true
        )
    );
    
    -- 2. Mantener solo las últimas 100 noticias por categoría
    FOR category_record IN 
        SELECT DISTINCT category FROM news
    LOOP
        WITH ranked_news AS (
            SELECT id,
                   ROW_NUMBER() OVER (ORDER BY pub_date DESC) as rn
            FROM news
            WHERE category = category_record.category
                AND is_featured = FALSE
        ),
        deleted AS (
            DELETE FROM news
            WHERE id IN (
                SELECT id FROM ranked_news WHERE rn > 100
            )
            RETURNING id
        )
        SELECT COUNT(*) INTO deleted_excess_news FROM deleted;
        
        IF deleted_excess_news > 0 THEN
            category_details := category_details || jsonb_build_object(
                'category', category_record.category::text,
                'deleted', deleted_excess_news
            );
        END IF;
    END LOOP;
    
    INSERT INTO cleanup_results VALUES (
        'Limitación por categoría (máx 100)',
        (category_details->>'deleted')::INTEGER,
        jsonb_build_object('by_category', category_details)
    );
    
    -- 3. Limpiar noticias destacadas muy antiguas (>7 días)
    DELETE FROM news 
    WHERE pub_date < NOW() - INTERVAL '7 days'
        AND is_featured = TRUE;
    
    GET DIAGNOSTICS deleted_old_news = ROW_COUNT;
    
    INSERT INTO cleanup_results VALUES (
        'Limpieza de destacadas antiguas (>7 días)',
        deleted_old_news,
        jsonb_build_object('featured_only', true)
    );
    
    -- 4. Limpiar registros de rate limiting antiguos
    DELETE FROM api_rate_limits
    WHERE window_start < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_old_news = ROW_COUNT;
    
    INSERT INTO cleanup_results VALUES (
        'Limpieza de rate limits',
        deleted_old_news,
        jsonb_build_object('older_than', '24 hours')
    );
    
    -- 5. Actualizar estadísticas de la base de datos
    ANALYZE news;
    
    -- Retornar resultados
    RETURN QUERY SELECT * FROM cleanup_results;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA DE LOGS DE LIMPIEZA
-- =============================================

CREATE TABLE IF NOT EXISTS cleanup_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    operation TEXT NOT NULL,
    affected_rows INTEGER,
    details JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

CREATE INDEX idx_cleanup_logs_executed ON cleanup_logs(executed_at DESC);

-- =============================================
-- FUNCIÓN WRAPPER PARA CRON CON LOGGING
-- =============================================

CREATE OR REPLACE FUNCTION scheduled_cleanup()
RETURNS void AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    exec_time_ms INTEGER;
    cleanup_record RECORD;
    total_deleted INTEGER = 0;
    error_msg TEXT;
BEGIN
    start_time := clock_timestamp();
    
    BEGIN
        -- Ejecutar limpieza y registrar resultados
        FOR cleanup_record IN 
            SELECT * FROM cleanup_old_news_with_logging()
        LOOP
            total_deleted := total_deleted + COALESCE(cleanup_record.affected_rows, 0);
            
            INSERT INTO cleanup_logs (
                operation, 
                affected_rows, 
                details
            ) VALUES (
                cleanup_record.operation,
                cleanup_record.affected_rows,
                cleanup_record.details
            );
        END LOOP;
        
        end_time := clock_timestamp();
        exec_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
        
        -- Registrar resumen general
        INSERT INTO cleanup_logs (
            operation,
            affected_rows,
            details,
            execution_time_ms,
            success
        ) VALUES (
            'Limpieza programada completada',
            total_deleted,
            jsonb_build_object(
                'timestamp', NOW(),
                'total_operations', 4
            ),
            exec_time_ms,
            TRUE
        );
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
        
        INSERT INTO cleanup_logs (
            operation,
            affected_rows,
            details,
            success,
            error_message
        ) VALUES (
            'Error en limpieza programada',
            0,
            jsonb_build_object('timestamp', NOW()),
            FALSE,
            error_msg
        );
        
        RAISE WARNING 'Error en limpieza programada: %', error_msg;
    END;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CONFIGURACIÓN DE CRON JOBS
-- =============================================

-- Programar limpieza diaria a las 3:00 AM UTC
SELECT cron.schedule(
    'cleanup-old-news-daily',           -- nombre del job
    '0 3 * * *',                        -- cron expression (diariamente a las 3 AM)
    $$SELECT scheduled_cleanup();$$     -- comando a ejecutar
);

-- Programar análisis de estadísticas semanalmente (domingos a las 4 AM)
SELECT cron.schedule(
    'analyze-news-weekly',
    '0 4 * * 0',
    $$ANALYZE news; ANALYZE cleanup_logs;$$
);

-- Programar limpieza de logs antiguos mensualmente (día 1 a las 2 AM)
SELECT cron.schedule(
    'cleanup-old-logs-monthly',
    '0 2 1 * *',
    $$DELETE FROM cleanup_logs WHERE executed_at < NOW() - INTERVAL '90 days';$$
);

-- =============================================
-- VISTAS PARA MONITOREO
-- =============================================

-- Vista para monitorear el estado de la limpieza
CREATE OR REPLACE VIEW cleanup_status AS
SELECT 
    DATE(executed_at) as date,
    COUNT(*) as operations_count,
    SUM(affected_rows) as total_rows_cleaned,
    AVG(execution_time_ms) as avg_execution_ms,
    COUNT(*) FILTER (WHERE success = FALSE) as failed_operations
FROM cleanup_logs
WHERE executed_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(executed_at)
ORDER BY date DESC;

-- Vista para estadísticas de noticias por categoría
CREATE OR REPLACE VIEW news_statistics AS
SELECT 
    category::text,
    COUNT(*) as total_news,
    COUNT(*) FILTER (WHERE is_featured = TRUE) as featured_count,
    COUNT(*) FILTER (WHERE pub_date > NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE pub_date > NOW() - INTERVAL '7 days') as last_7d,
    MIN(pub_date) as oldest_news,
    MAX(pub_date) as newest_news,
    AVG(view_count) as avg_views
FROM news
GROUP BY category
ORDER BY total_news DESC;

-- =============================================
-- FUNCIONES DE UTILIDAD
-- =============================================

-- Función para ejecutar limpieza manual
CREATE OR REPLACE FUNCTION manual_cleanup(
    dry_run BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    action TEXT,
    would_delete INTEGER,
    details JSONB
) AS $$
BEGIN
    IF dry_run THEN
        -- Modo simulación: solo mostrar qué se eliminaría
        RETURN QUERY
        WITH old_news AS (
            SELECT COUNT(*) as cnt 
            FROM news 
            WHERE pub_date < NOW() - INTERVAL '60 days' 
                AND is_featured = FALSE
        ),
        featured_old AS (
            SELECT COUNT(*) as cnt 
            FROM news 
            WHERE pub_date < NOW() - INTERVAL '7 days' 
                AND is_featured = TRUE
        ),
        excess_by_category AS (
            SELECT category::text, COUNT(*) - 100 as excess
            FROM news
            WHERE is_featured = FALSE
            GROUP BY category
            HAVING COUNT(*) > 100
        )
        SELECT 
            'Noticias antiguas (>60 días)' as action,
            (SELECT cnt FROM old_news)::INTEGER as would_delete,
            jsonb_build_object('dry_run', true) as details
        UNION ALL
        SELECT 
            'Destacadas antiguas (>7 días)',
            (SELECT cnt FROM featured_old)::INTEGER,
            jsonb_build_object('dry_run', true)
        UNION ALL
        SELECT 
            'Exceso por categoría',
            (SELECT COALESCE(SUM(excess), 0) FROM excess_by_category)::INTEGER,
            (SELECT jsonb_agg(row_to_json(excess_by_category)) FROM excess_by_category);
    ELSE
        -- Modo ejecución real
        RETURN QUERY SELECT * FROM cleanup_old_news_with_logging();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON FUNCTION scheduled_cleanup() 
    IS 'Función principal de limpieza programada con logging completo';

COMMENT ON TABLE cleanup_logs 
    IS 'Registro histórico de todas las operaciones de limpieza ejecutadas';

COMMENT ON VIEW cleanup_status 
    IS 'Vista de monitoreo del estado y rendimiento de las limpiezas';

COMMENT ON VIEW news_statistics 
    IS 'Estadísticas actuales de noticias por categoría';

COMMENT ON FUNCTION manual_cleanup(BOOLEAN) 
    IS 'Ejecuta limpieza manual con opción de dry-run para simular';

-- =============================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- =============================================

-- Query para verificar jobs programados
SELECT 
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    username
FROM cron.job
WHERE jobname LIKE '%news%' OR jobname LIKE '%cleanup%';