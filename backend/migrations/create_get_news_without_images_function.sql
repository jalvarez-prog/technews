-- Función para obtener noticias sin imagen
-- Esta función debe ejecutarse en Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_news_without_images(limit_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category VARCHAR(50),
  link TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.description,
    n.category,
    n.link,
    n.created_at
  FROM news n
  WHERE n.image_url IS NULL 
     OR n.image_url = ''
  ORDER BY n.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION get_news_without_images TO anon;
GRANT EXECUTE ON FUNCTION get_news_without_images TO authenticated;
GRANT EXECUTE ON FUNCTION get_news_without_images TO service_role;

-- Comentario para documentación
COMMENT ON FUNCTION get_news_without_images IS 'Obtiene noticias que no tienen imagen asignada, limitado por el parámetro limit_count';