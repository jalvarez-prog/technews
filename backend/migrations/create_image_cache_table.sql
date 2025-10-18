-- Crear tabla para caché de imágenes
CREATE TABLE IF NOT EXISTS image_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_hash VARCHAR(32) UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- rss_feed, article_extraction, unsplash, pexels, generated
  last_validated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_image_cache_article_hash ON image_cache(article_hash);
CREATE INDEX IF NOT EXISTS idx_image_cache_source ON image_cache(source);
CREATE INDEX IF NOT EXISTS idx_image_cache_last_validated ON image_cache(last_validated);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.usage_count = OLD.usage_count + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_image_cache_updated_at 
  BEFORE UPDATE ON image_cache 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Política de limpieza: eliminar entradas no validadas en más de 90 días
CREATE OR REPLACE FUNCTION cleanup_old_image_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM image_cache 
    WHERE last_validated < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE image_cache IS 'Caché de URLs de imágenes para evitar duplicados y mejorar rendimiento';
COMMENT ON COLUMN image_cache.article_hash IS 'Hash MD5 del título + link del artículo';
COMMENT ON COLUMN image_cache.source IS 'Fuente de donde se obtuvo la imagen';
COMMENT ON COLUMN image_cache.usage_count IS 'Número de veces que se ha usado esta imagen';