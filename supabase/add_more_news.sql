-- =============================================
-- SCRIPT PARA AÑADIR MÁS NOTICIAS VARIADAS
-- Esto mejorará la variedad del ticker
-- =============================================

-- Primero, vamos a marcar más noticias existentes como destacadas
UPDATE news 
SET is_featured = TRUE, severity = 'trending'
WHERE title LIKE '%Kubernetes%' OR title LIKE '%Matter%';

-- Ahora añadimos más noticias variadas por categoría
-- CYBERSECURITY - 10 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'Ataque masivo de ransomware afecta a hospitales europeos'
        WHEN 2 THEN 'NSA publica herramienta gratuita de detección de malware'
        WHEN 3 THEN 'Falla crítica en routers Cisco expone millones de dispositivos'
        WHEN 4 THEN 'Hackers rusos infiltran sistemas gubernamentales de la OTAN'
        WHEN 5 THEN 'Nueva técnica de phishing evade todos los filtros de Gmail'
        WHEN 6 THEN 'Microsoft parcheó 117 vulnerabilidades en actualización masiva'
        WHEN 7 THEN 'Grupo Lazarus roba $600M en criptomonedas de exchange japonés'
        WHEN 8 THEN 'Zero-day en Chrome explotado activamente por grupos APT'
        WHEN 9 THEN 'Filtración masiva expone 2.5 billones de contraseñas'
        WHEN 10 THEN 'Nuevo malware para Mac evade detección de XProtect'
      END,
      CASE i
        WHEN 1 THEN 'Más de 20 hospitales en Alemania, Francia y España han sido víctimas de un ataque coordinado de ransomware del grupo BlackCat.'
        WHEN 2 THEN 'La Agencia de Seguridad Nacional de EE.UU. libera GHIDRA 10.4, su herramienta de ingeniería inversa, con nuevas capacidades de análisis.'
        WHEN 3 THEN 'Una vulnerabilidad crítica en el firmware de routers Cisco ASA permite ejecución remota de código sin autenticación.'
        WHEN 4 THEN 'Investigadores de seguridad descubren una campaña de espionaje de 5 años dirigida a infraestructura crítica de la OTAN.'
        WHEN 5 THEN 'Criminales utilizan IA generativa para crear emails de phishing indistinguibles de comunicaciones legítimas.'
        WHEN 6 THEN 'La actualización mensual de Microsoft corrige vulnerabilidades críticas en Windows, Office, Edge y Azure.'
        WHEN 7 THEN 'El notorious grupo norcoreano Lazarus ejecuta el robo de criptomonedas más grande del año 2024.'
        WHEN 8 THEN 'Google confirma que CVE-2024-0519 está siendo explotado en ataques dirigidos contra periodistas y activistas.'
        WHEN 9 THEN 'La base de datos "Mother of all Breaches" contiene credenciales de LinkedIn, Twitter, Tencent y otras plataformas.'
        WHEN 10 THEN 'LockBit Mac, nueva variante del ransomware, afecta específicamente a usuarios de macOS Sonoma.'
      END,
      'https://example.com/cyber-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '1 hour' * i,
      CASE (i % 4)
        WHEN 0 THEN 'The Hacker News'
        WHEN 1 THEN 'Bleeping Computer'
        WHEN 2 THEN 'Dark Reading'
        WHEN 3 THEN 'KrebsOnSecurity'
      END,
      'cybersecurity',
      'https://picsum.photos/800/400?random=' || (100 + i),
      NULL,
      CASE WHEN i <= 3 THEN TRUE ELSE FALSE END,  -- Las primeras 3 son destacadas
      CASE i
        WHEN 1 THEN 'critical'
        WHEN 2 THEN 'high'
        WHEN 3 THEN 'hot'
        ELSE 'medium'
      END,
      ARRAY['seguridad', 'hacking', 'ciberseguridad']
    );
  END LOOP;
END $$;

-- AI - 10 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'Anthropic lanza Claude 3.5 superando a GPT-4 en benchmarks'
        WHEN 2 THEN 'Meta open-sourcea Llama 3 con 405B parámetros'
        WHEN 3 THEN 'DeepMind resuelve problema matemático del milenio con AlphaProof'
        WHEN 4 THEN 'Nvidia presenta chip H200 optimizado para entrenamiento de LLMs'
        WHEN 5 THEN 'Midjourney v6 genera videos fotorrealistas de 60 segundos'
        WHEN 6 THEN 'OpenAI anuncia GPT Store con más de 3 millones de GPTs personalizados'
        WHEN 7 THEN 'Estudio MIT: IA diagnostica cáncer con 99.5% de precisión'
        WHEN 8 THEN 'Google Gemini Ultra disponible para desarrolladores'
        WHEN 9 THEN 'Stable Diffusion XL 2.0 corre nativamente en iPhone 15 Pro'
        WHEN 10 THEN 'China presenta Ernie 4.0 compitiendo directamente con ChatGPT'
      END,
      CASE i
        WHEN 1 THEN 'El nuevo modelo de Anthropic muestra capacidades de razonamiento superiores y ventana de contexto de 200K tokens.'
        WHEN 2 THEN 'Meta democratiza la IA con su modelo más grande hasta la fecha, disponible para uso comercial sin restricciones.'
        WHEN 3 THEN 'AlphaProof de DeepMind resuelve 4 de 6 problemas de la Olimpiada Internacional de Matemáticas.'
        WHEN 4 THEN 'El nuevo chip de Nvidia ofrece 141GB de memoria HBM3e y rendimiento 90% superior al H100.'
        WHEN 5 THEN 'La nueva versión de Midjourney genera videos con coherencia temporal y calidad cinematográfica.'
        WHEN 6 THEN 'La tienda de aplicaciones de IA de OpenAI supera los $100M en transacciones mensuales.'
        WHEN 7 THEN 'Investigadores del MIT desarrollan sistema de IA que detecta 20 tipos de cáncer en etapas tempranas.'
        WHEN 8 THEN 'Google lanza acceso API a su modelo más avanzado con capacidades multimodales nativas.'
        WHEN 9 THEN 'La optimización de Stable Diffusion permite generación de imágenes en dispositivo sin conexión a internet.'
        WHEN 10 THEN 'Baidu anuncia que Ernie 4.0 supera a GPT-4 en comprensión del chino mandarín.'
      END,
      'https://example.com/ai-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '90 minutes' * i,
      CASE (i % 4)
        WHEN 0 THEN 'AI News'
        WHEN 1 THEN 'VentureBeat'
        WHEN 2 THEN 'MIT Technology Review'
        WHEN 3 THEN 'The Information'
      END,
      'ai',
      'https://picsum.photos/800/400?random=' || (200 + i),
      NULL,
      CASE WHEN i <= 4 THEN TRUE ELSE FALSE END,  -- Las primeras 4 son destacadas
      CASE i
        WHEN 1 THEN 'hot'
        WHEN 2 THEN 'trending'
        WHEN 3 THEN 'hot'
        WHEN 4 THEN 'high'
        ELSE 'medium'
      END,
      ARRAY['ia', 'inteligencia-artificial', 'machine-learning']
    );
  END LOOP;
END $$;

-- CLOUD - 8 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'AWS anuncia región de datos en España para 2025'
        WHEN 2 THEN 'Azure Container Apps ahora soporta GPUs para workloads de IA'
        WHEN 3 THEN 'Google Cloud reduce precios de egress en 50% globalmente'
        WHEN 4 THEN 'Cloudflare Workers supera 3 millones de aplicaciones desplegadas'
        WHEN 5 THEN 'Oracle Cloud supera a AWS en benchmark de bases de datos'
        WHEN 6 THEN 'Kubernetes 1.29 introduce sidecars nativos'
        WHEN 7 THEN 'DigitalOcean adquiere Paperspace por $111M'
        WHEN 8 THEN 'VMware Cloud on AWS reduce costos en 40%'
      END,
      CASE i
        WHEN 1 THEN 'Amazon Web Services construirá tres centros de datos en Madrid con inversión de €2.5 billones.'
        WHEN 2 THEN 'Microsoft añade soporte nativo para NVIDIA A100 y H100 en su plataforma de contenedores serverless.'
        WHEN 3 THEN 'Google Cloud elimina cargos de transferencia para clientes migrando desde otros proveedores.'
        WHEN 4 THEN 'La plataforma edge computing de Cloudflare procesa 50 millones de requests por segundo.'
        WHEN 5 THEN 'Benchmarks independientes muestran que Oracle Autonomous Database es 7x más rápido que RDS.'
        WHEN 6 THEN 'La nueva versión de Kubernetes simplifica el despliegue de aplicaciones con múltiples contenedores.'
        WHEN 7 THEN 'DigitalOcean expande su oferta de GPU cloud con la adquisición de Paperspace.'
        WHEN 8 THEN 'VMware anuncia nueva estructura de precios que reduce significativamente el TCO.'
      END,
      'https://example.com/cloud-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '2 hours' * i,
      CASE (i % 3)
        WHEN 0 THEN 'Cloud Computing News'
        WHEN 1 THEN 'The Register'
        WHEN 2 THEN 'InfoWorld'
      END,
      'cloud',
      'https://picsum.photos/800/400?random=' || (300 + i),
      NULL,
      CASE WHEN i <= 3 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'trending'
        WHEN 2 THEN 'hot'
        WHEN 3 THEN 'high'
        ELSE 'medium'
      END,
      ARRAY['cloud', 'nube', 'infraestructura']
    );
  END LOOP;
END $$;

-- QUANTUM - 6 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'IBM Quantum Network alcanza 1,121 qubits estables'
        WHEN 2 THEN 'China logra teleportación cuántica a 1,200 km de distancia'
        WHEN 3 THEN 'Microsoft Azure Quantum resuelve problema de optimización imposible clásicamente'
        WHEN 4 THEN 'Rigetti Computing cotiza en NASDAQ tras fusión SPAC'
        WHEN 5 THEN 'Algoritmo cuántico reduce tiempo de entrenamiento de IA en 10,000x'
        WHEN 6 THEN 'IonQ anuncia computadora cuántica de 32 qubits para 2025'
      END,
      CASE i
        WHEN 1 THEN 'IBM demuestra supremacía cuántica práctica con su procesador Condor de nueva generación.'
        WHEN 2 THEN 'Científicos chinos establecen récord mundial en comunicación cuántica satelital.'
        WHEN 3 THEN 'Azure Quantum resuelve problema de logística con 100,000 variables en 30 segundos.'
        WHEN 4 THEN 'La empresa de computación cuántica Rigetti debuta en bolsa con valoración de $1.5B.'
        WHEN 5 THEN 'Investigadores de Oxford desarrollan QML algorithm que revoluciona el machine learning.'
        WHEN 6 THEN 'IonQ promete la primera computadora cuántica comercialmente viable para empresas medianas.'
      END,
      'https://example.com/quantum-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '3 hours' * i,
      CASE (i % 3)
        WHEN 0 THEN 'Quantum Computing Report'
        WHEN 1 THEN 'The Quantum Insider'
        WHEN 2 THEN 'Nature Quantum'
      END,
      'quantum',
      'https://picsum.photos/800/400?random=' || (400 + i),
      NULL,
      CASE WHEN i <= 2 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'hot'
        WHEN 2 THEN 'trending'
        ELSE 'medium'
      END,
      ARRAY['quantum', 'cuantico', 'qubits']
    );
  END LOOP;
END $$;

-- FINANCE-CRYPTO - 8 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'Ethereum ETF aprobado por SEC comienza a cotizar'
        WHEN 2 THEN 'El Salvador compra 5,000 Bitcoin adicionales'
        WHEN 3 THEN 'PayPal lanza stablecoin PYUSD en Solana'
        WHEN 4 THEN 'BlackRock: Bitcoin ETF supera $10B en activos'
        WHEN 5 THEN 'Visa procesa $2.5 trillones en pagos crypto en 2024'
        WHEN 6 THEN 'Argentina aprueba Bitcoin como moneda de curso legal'
        WHEN 7 THEN 'DeFi TVL alcanza nuevo máximo de $200B'
        WHEN 8 THEN 'Binance obtiene licencia para operar en Francia'
      END,
      CASE i
        WHEN 1 THEN 'La SEC aprueba 9 ETFs de Ethereum spot que comenzaron a cotizar con volumen récord de $1B.'
        WHEN 2 THEN 'El presidente Bukele anuncia la mayor compra de Bitcoin del país centroamericano.'
        WHEN 3 THEN 'PayPal expande su stablecoin a la blockchain de Solana para reducir fees de transacción.'
        WHEN 4 THEN 'El fondo de Bitcoin de BlackRock se convierte en el ETF de más rápido crecimiento en la historia.'
        WHEN 5 THEN 'Visa reporta crecimiento del 300% en volumen de transacciones crypto año a año.'
        WHEN 6 THEN 'Argentina se convierte en el segundo país en adoptar Bitcoin como moneda oficial.'
        WHEN 7 THEN 'El valor total bloqueado en protocolos DeFi supera el pico de 2021.'
        WHEN 8 THEN 'Binance recibe aprobación regulatoria completa para servicios crypto en la Unión Europea.'
      END,
      'https://example.com/crypto-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '2 hours' * i,
      CASE (i % 4)
        WHEN 0 THEN 'CoinDesk'
        WHEN 1 THEN 'CoinTelegraph'
        WHEN 2 THEN 'The Block'
        WHEN 3 THEN 'Decrypt'
      END,
      'finance-crypto',
      'https://picsum.photos/800/400?random=' || (500 + i),
      NULL,
      CASE WHEN i <= 3 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'hot'
        WHEN 2 THEN 'trending'
        WHEN 3 THEN 'high'
        ELSE 'medium'
      END,
      ARRAY['crypto', 'bitcoin', 'blockchain']
    );
  END LOOP;
END $$;

-- SOFTWARE-DEVOPS - 7 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'GitHub Copilot Workspace: IDE completo en la nube con IA'
        WHEN 2 THEN 'Docker Desktop 5.0 incluye Kubernetes integrado'
        WHEN 3 THEN 'TypeScript 5.4 añade inferencia de tipos mejorada'
        WHEN 4 THEN 'Rust adoptado oficialmente en el kernel de Windows'
        WHEN 5 THEN 'Jenkins fue declarado obsoleto por la CNCF'
        WHEN 6 THEN 'Go 1.22 mejora performance en 25%'
        WHEN 7 THEN 'GitLab adquiere competitor UnReview por $230M'
      END,
      CASE i
        WHEN 1 THEN 'GitHub revoluciona el desarrollo con un entorno de desarrollo completo potenciado por IA en el navegador.'
        WHEN 2 THEN 'La nueva versión de Docker Desktop incluye un cluster K8s de un nodo para desarrollo local.'
        WHEN 3 THEN 'Microsoft lanza TypeScript 5.4 con mejoras significativas en el sistema de tipos y performance.'
        WHEN 4 THEN 'Microsoft confirma que componentes críticos de Windows 12 serán escritos en Rust.'
        WHEN 5 THEN 'La Cloud Native Computing Foundation recomienda migrar de Jenkins a alternativas modernas.'
        WHEN 6 THEN 'La última versión de Go incluye optimizaciones del garbage collector y compilador.'
        WHEN 7 THEN 'GitLab expande su plataforma DevOps con la adquisición de herramientas de code review con IA.'
      END,
      'https://example.com/devops-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '100 minutes' * i,
      CASE (i % 3)
        WHEN 0 THEN 'InfoQ'
        WHEN 1 THEN 'DevOps.com'
        WHEN 2 THEN 'The New Stack'
      END,
      'software-devops',
      'https://picsum.photos/800/400?random=' || (600 + i),
      NULL,
      CASE WHEN i <= 2 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'hot'
        WHEN 2 THEN 'trending'
        ELSE 'medium'
      END,
      ARRAY['desarrollo', 'programacion', 'devops']
    );
  END LOOP;
END $$;

-- IOT - 5 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'Apple HomeKit 3.0 soporta Matter y Thread nativo'
        WHEN 2 THEN 'Samsung SmartThings alcanza 100 millones de dispositivos'
        WHEN 3 THEN 'ESP32-C6 con WiFi 6 y Bluetooth 5.3 por $3'
        WHEN 4 THEN 'Amazon Sidewalk cubre 90% de población US'
        WHEN 5 THEN 'Raspberry Pi 5 con NPU para IA edge'
      END,
      CASE i
        WHEN 1 THEN 'Apple actualiza HomeKit con soporte completo para el estándar Matter y protocolo Thread.'
        WHEN 2 THEN 'La plataforma IoT de Samsung celebra milestone con ecosistema de 5,000 fabricantes.'
        WHEN 3 THEN 'Espressif lanza el microcontrolador más barato con WiFi 6 del mercado.'
        WHEN 4 THEN 'La red LoRa de Amazon alcanza cobertura casi completa en Estados Unidos.'
        WHEN 5 THEN 'La nueva Raspberry Pi incluye procesador neuronal para IA en el edge.'
      END,
      'https://example.com/iot-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '150 minutes' * i,
      CASE (i % 2)
        WHEN 0 THEN 'IoT World Today'
        WHEN 1 THEN 'Stacey on IoT'
      END,
      'iot',
      'https://picsum.photos/800/400?random=' || (700 + i),
      NULL,
      CASE WHEN i <= 2 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'trending'
        WHEN 2 THEN 'hot'
        ELSE 'medium'
      END,
      ARRAY['iot', 'domotica', 'smart-home']
    );
  END LOOP;
END $$;

-- DATA-SCIENCE - 5 noticias adicionales
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM insert_news_safe(
      CASE i
        WHEN 1 THEN 'Pandas 2.2 es 10x más rápido con backend Arrow'
        WHEN 2 THEN 'Jupyter Notebook ahora con copiloto IA integrado'
        WHEN 3 THEN 'Databricks valued at $43B tras ronda Serie J'
        WHEN 4 THEN 'Python 3.13 optimizaciones para data science'
        WHEN 5 THEN 'Snowflake adquiere Streamlit por $800M'
      END,
      CASE i
        WHEN 1 THEN 'La nueva versión de Pandas utiliza Apache Arrow como backend por defecto mejorando dramáticamente el rendimiento.'
        WHEN 2 THEN 'JupyterLab 4.1 incluye asistente de IA que sugiere código y visualizaciones automáticamente.'
        WHEN 3 THEN 'Databricks se convierte en la startup de data más valiosa del mundo.'
        WHEN 4 THEN 'Python 3.13 incluye optimizaciones específicas para NumPy y operaciones vectorizadas.'
        WHEN 5 THEN 'Snowflake expande su plataforma con herramientas de visualización interactiva.'
      END,
      'https://example.com/datascience-news-' || i || '-' || gen_random_uuid(),
      NOW() - INTERVAL '180 minutes' * i,
      CASE (i % 2)
        WHEN 0 THEN 'KDnuggets'
        WHEN 1 THEN 'Towards Data Science'
      END,
      'data-science',
      'https://picsum.photos/800/400?random=' || (800 + i),
      NULL,
      CASE WHEN i = 1 THEN TRUE ELSE FALSE END,
      CASE i
        WHEN 1 THEN 'hot'
        ELSE 'medium'
      END,
      ARRAY['data', 'analytics', 'bigdata']
    );
  END LOOP;
END $$;

-- RESUMEN FINAL
DO $$
DECLARE
  total_news INTEGER;
  featured_news INTEGER;
  categories_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_news FROM news;
  SELECT COUNT(*) INTO featured_news FROM news WHERE is_featured = TRUE;
  SELECT COUNT(DISTINCT category) INTO categories_count FROM news;
  
  RAISE NOTICE '✅ ACTUALIZACIÓN COMPLETADA';
  RAISE NOTICE '📊 Total de noticias: %', total_news;
  RAISE NOTICE '⭐ Noticias destacadas para ticker: %', featured_news;
  RAISE NOTICE '📁 Categorías con contenido: %', categories_count;
END $$;

-- Ver resumen actualizado
SELECT 
    category::text as "Categoría",
    COUNT(*) as "Total",
    COUNT(*) FILTER (WHERE is_featured = TRUE) as "Destacadas",
    COUNT(*) FILTER (WHERE severity = 'hot') as "Hot",
    COUNT(*) FILTER (WHERE severity = 'trending') as "Trending",
    COUNT(*) FILTER (WHERE severity = 'critical') as "Critical"
FROM news
GROUP BY category
ORDER BY COUNT(*) DESC;