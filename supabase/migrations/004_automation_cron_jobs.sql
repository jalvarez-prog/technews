-- =============================================
-- AUTOMATED CRON JOBS CONFIGURATION
-- Version: 1.0.0
-- Date: 2025-01-13
-- Description: Configuración de trabajos automatizados para actualización de noticias
-- =============================================

-- Crear tabla para logs de automatización
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    news_processed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_logs_workflow ON automation_logs(workflow, started_at DESC);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);

-- =============================================
-- FUNCIÓN PARA ACTUALIZACIÓN DE NOTICIAS (24H)
-- =============================================

CREATE OR REPLACE FUNCTION automated_news_update()
RETURNS TABLE (
    status TEXT,
    news_count INTEGER,
    errors INTEGER,
    duration_seconds INTEGER
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    total_news INTEGER := 0;
    total_errors INTEGER := 0;
    log_id UUID;
BEGIN
    start_time := clock_timestamp();
    
    -- Crear registro de log
    INSERT INTO automation_logs (workflow, status, started_at)
    VALUES ('news_update_24h', 'running', start_time)
    RETURNING id INTO log_id;
    
    -- Aquí iría la llamada al servicio de scraping
    -- Por ahora, simulamos la actualización
    
    -- Marcar feeds para actualización
    UPDATE feed_updates
    SET last_fetched = NOW()
    WHERE is_active = TRUE;
    
    -- Simular procesamiento (reemplazar con llamada real al scraper)
    total_news := 150; -- Placeholder
    total_errors := 2; -- Placeholder
    
    end_time := clock_timestamp();
    
    -- Actualizar log
    UPDATE automation_logs
    SET status = 'completed',
        completed_at = end_time,
        duration_seconds = EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER,
        news_processed = total_news,
        errors_count = total_errors,
        details = jsonb_build_object(
            'feeds_updated', (SELECT COUNT(*) FROM feed_updates WHERE is_active = TRUE),
            'categories_processed', 8,
            'timestamp', end_time
        )
    WHERE id = log_id;
    
    -- Ejecutar limpieza después de actualización
    PERFORM cleanup_old_news();
    
    RETURN QUERY
    SELECT 
        'success'::TEXT as status,
        total_news as news_count,
        total_errors as errors,
        EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER as duration_seconds;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN PARA ACTUALIZACIÓN DEL TICKER (5H)
-- =============================================

CREATE OR REPLACE FUNCTION automated_ticker_update()
RETURNS TABLE (
    status TEXT,
    featured_count INTEGER,
    categories_updated INTEGER
) AS $$
DECLARE
    featured_news INTEGER := 0;
    categories INTEGER := 0;
    log_id UUID;
BEGIN
    -- Crear registro de log
    INSERT INTO automation_logs (workflow, status, started_at)
    VALUES ('ticker_update_5h', 'running', NOW())
    RETURNING id INTO log_id;
    
    -- Quitar destacado de noticias viejas (>24h)
    UPDATE news
    SET is_featured = FALSE
    WHERE is_featured = TRUE
        AND pub_date < NOW() - INTERVAL '24 hours';
    
    -- Para cada categoría, destacar las noticias más importantes
    FOR categories IN 1..8 LOOP
        WITH top_news AS (
            SELECT id
            FROM news
            WHERE category = ANY(ARRAY['cybersecurity', 'ai', 'finance-crypto', 'software-devops', 'iot', 'cloud', 'data-science', 'quantum']::news_category[])
                AND pub_date > NOW() - INTERVAL '24 hours'
                AND severity IN ('critical', 'high', 'hot', 'trending')
            ORDER BY 
                CASE severity
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'hot' THEN 3
                    WHEN 'trending' THEN 4
                    ELSE 5
                END,
                pub_date DESC
            LIMIT 6
        )
        UPDATE news
        SET is_featured = TRUE
        FROM top_news
        WHERE news.id = top_news.id;
        
        featured_news := featured_news + 6;
    END LOOP;
    
    -- Actualizar log
    UPDATE automation_logs
    SET status = 'completed',
        completed_at = NOW(),
        news_processed = featured_news,
        details = jsonb_build_object(
            'featured_news', featured_news,
            'categories_updated', 8,
            'timestamp', NOW()
        )
    WHERE id = log_id;
    
    RETURN QUERY
    SELECT 
        'success'::TEXT as status,
        featured_news as featured_count,
        8 as categories_updated;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CONFIGURAR CRON JOBS
-- =============================================

-- Job 1: Actualización de noticias cada 24 horas (00:00 UTC)
SELECT cron.schedule(
    'automated-news-update-24h',
    '0 0 * * *',
    $$SELECT automated_news_update();$$
);

-- Job 2: Actualización del ticker cada 5 horas
-- 00:00, 05:00, 10:00, 15:00, 20:00 UTC
SELECT cron.schedule(
    'automated-ticker-update-5h-00',
    '0 0 * * *',
    $$SELECT automated_ticker_update();$$
);

SELECT cron.schedule(
    'automated-ticker-update-5h-05',
    '0 5 * * *',
    $$SELECT automated_ticker_update();$$
);

SELECT cron.schedule(
    'automated-ticker-update-5h-10',
    '0 10 * * *',
    $$SELECT automated_ticker_update();$$
);

SELECT cron.schedule(
    'automated-ticker-update-5h-15',
    '0 15 * * *',
    $$SELECT automated_ticker_update();$$
);

SELECT cron.schedule(
    'automated-ticker-update-5h-20',
    '0 20 * * *',
    $$SELECT automated_ticker_update();$$
);

-- Job 3: Limpieza de logs antiguos (mensual)
SELECT cron.schedule(
    'cleanup-automation-logs-monthly',
    '0 3 1 * *',
    $$DELETE FROM automation_logs WHERE created_at < NOW() - INTERVAL '90 days';$$
);

-- =============================================
-- VISTAS DE MONITOREO
-- =============================================

-- Vista para monitorear el estado de las automatizaciones
CREATE OR REPLACE VIEW automation_status AS
SELECT 
    workflow,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_runs,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
    AVG(duration_seconds) FILTER (WHERE status = 'completed') as avg_duration_seconds,
    SUM(news_processed) as total_news_processed,
    MAX(started_at) as last_run,
    MIN(started_at) as first_run
FROM automation_logs
WHERE started_at > NOW() - INTERVAL '30 days'
GROUP BY workflow
ORDER BY workflow;

-- Vista para el último estado de cada workflow
CREATE OR REPLACE VIEW automation_last_run AS
SELECT DISTINCT ON (workflow)
    workflow,
    status,
    started_at,
    completed_at,
    duration_seconds,
    news_processed,
    errors_count,
    details
FROM automation_logs
ORDER BY workflow, started_at DESC;

-- =============================================
-- FUNCIONES DE MONITOREO
-- =============================================

-- Función para verificar salud del sistema de automatización
CREATE OR REPLACE FUNCTION check_automation_health()
RETURNS TABLE (
    workflow TEXT,
    is_healthy BOOLEAN,
    last_run_age_hours INTEGER,
    last_status TEXT,
    message TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH last_runs AS (
        SELECT DISTINCT ON (workflow)
            workflow,
            status,
            started_at,
            EXTRACT(EPOCH FROM (NOW() - started_at)) / 3600 as hours_since_run
        FROM automation_logs
        ORDER BY workflow, started_at DESC
    )
    SELECT 
        lr.workflow::TEXT,
        CASE 
            WHEN lr.workflow = 'news_update_24h' AND lr.hours_since_run > 25 THEN FALSE
            WHEN lr.workflow = 'ticker_update_5h' AND lr.hours_since_run > 6 THEN FALSE
            WHEN lr.status != 'completed' THEN FALSE
            ELSE TRUE
        END as is_healthy,
        lr.hours_since_run::INTEGER as last_run_age_hours,
        lr.status::TEXT as last_status,
        CASE 
            WHEN lr.workflow = 'news_update_24h' AND lr.hours_since_run > 25 THEN 
                'Warning: News update has not run in over 24 hours'
            WHEN lr.workflow = 'ticker_update_5h' AND lr.hours_since_run > 6 THEN 
                'Warning: Ticker update has not run in over 5 hours'
            WHEN lr.status != 'completed' THEN 
                'Error: Last run did not complete successfully'
            ELSE 'OK'
        END as message
    FROM last_runs lr;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS PARA ALERTAS
-- =============================================

-- Función para enviar alerta si falla una automatización
CREATE OR REPLACE FUNCTION notify_automation_failure()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'failed' THEN
        -- Aquí se podría integrar con un sistema de notificaciones
        -- Por ahora, solo registramos en una tabla de alertas
        INSERT INTO automation_logs (
            workflow,
            status,
            started_at,
            details
        ) VALUES (
            'alert_' || NEW.workflow,
            'alert_sent',
            NOW(),
            jsonb_build_object(
                'failed_workflow', NEW.workflow,
                'failed_at', NEW.started_at,
                'alert_type', 'automation_failure'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_failure_alert
    AFTER UPDATE OF status ON automation_logs
    FOR EACH ROW
    WHEN (NEW.status = 'failed')
    EXECUTE FUNCTION notify_automation_failure();

-- =============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================

COMMENT ON FUNCTION automated_news_update() 
    IS 'Función principal para actualización automática de noticias cada 24 horas';

COMMENT ON FUNCTION automated_ticker_update() 
    IS 'Función para actualizar noticias destacadas del ticker cada 5 horas';

COMMENT ON FUNCTION check_automation_health() 
    IS 'Verifica el estado de salud del sistema de automatización';

COMMENT ON TABLE automation_logs 
    IS 'Registro histórico de todas las ejecuciones de automatización';

COMMENT ON VIEW automation_status 
    IS 'Vista agregada del estado de las automatizaciones';

COMMENT ON VIEW automation_last_run 
    IS 'Vista del último estado de cada workflow de automatización';