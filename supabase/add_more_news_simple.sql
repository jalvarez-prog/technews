-- =============================================
-- SCRIPT SIMPLIFICADO PARA AÑADIR MÁS NOTICIAS
-- Inserta directamente sin usar funciones
-- =============================================

-- Primero, vamos a marcar algunas noticias existentes como destacadas
UPDATE news 
SET is_featured = TRUE, severity = 'trending'
WHERE (title LIKE '%Kubernetes%' OR title LIKE '%Matter%' OR title LIKE '%AutoML%')
  AND is_featured = FALSE;

-- CYBERSECURITY - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'Ataque masivo de ransomware afecta a hospitales europeos',
    'Más de 20 hospitales en Alemania, Francia y España han sido víctimas de un ataque coordinado de ransomware del grupo BlackCat.',
    'https://example.com/cyber-1-' || gen_random_uuid(),
    NOW() - INTERVAL '1 hour',
    'The Hacker News',
    'cybersecurity',
    'https://picsum.photos/800/400?random=101',
    TRUE,
    'critical',
    ARRAY['seguridad', 'ransomware', 'hospitales']
),
(
    'NSA publica herramienta gratuita de detección de malware',
    'La Agencia de Seguridad Nacional de EE.UU. libera GHIDRA 10.4, su herramienta de ingeniería inversa, con nuevas capacidades.',
    'https://example.com/cyber-2-' || gen_random_uuid(),
    NOW() - INTERVAL '2 hours',
    'Bleeping Computer',
    'cybersecurity',
    'https://picsum.photos/800/400?random=102',
    TRUE,
    'high',
    ARRAY['nsa', 'ghidra', 'malware']
),
(
    'Falla crítica en routers Cisco expone millones de dispositivos',
    'Una vulnerabilidad crítica en el firmware de routers Cisco ASA permite ejecución remota de código sin autenticación.',
    'https://example.com/cyber-3-' || gen_random_uuid(),
    NOW() - INTERVAL '3 hours',
    'Dark Reading',
    'cybersecurity',
    'https://picsum.photos/800/400?random=103',
    TRUE,
    'hot',
    ARRAY['cisco', 'vulnerabilidad', 'routers']
),
(
    'Hackers rusos infiltran sistemas gubernamentales de la OTAN',
    'Investigadores descubren una campaña de espionaje de 5 años dirigida a infraestructura crítica de la OTAN.',
    'https://example.com/cyber-4-' || gen_random_uuid(),
    NOW() - INTERVAL '4 hours',
    'KrebsOnSecurity',
    'cybersecurity',
    'https://picsum.photos/800/400?random=104',
    FALSE,
    'high',
    ARRAY['apt', 'rusia', 'otan']
),
(
    'Nueva técnica de phishing evade todos los filtros de Gmail',
    'Criminales utilizan IA generativa para crear emails de phishing indistinguibles de comunicaciones legítimas.',
    'https://example.com/cyber-5-' || gen_random_uuid(),
    NOW() - INTERVAL '5 hours',
    'The Hacker News',
    'cybersecurity',
    'https://picsum.photos/800/400?random=105',
    FALSE,
    'medium',
    ARRAY['phishing', 'gmail', 'ia']
);

-- AI - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'Anthropic lanza Claude 3.5 superando a GPT-4 en benchmarks',
    'El nuevo modelo de Anthropic muestra capacidades de razonamiento superiores y ventana de contexto de 200K tokens.',
    'https://example.com/ai-1-' || gen_random_uuid(),
    NOW() - INTERVAL '90 minutes',
    'AI News',
    'ai',
    'https://picsum.photos/800/400?random=201',
    TRUE,
    'hot',
    ARRAY['anthropic', 'claude', 'llm']
),
(
    'Meta open-sourcea Llama 3 con 405B parámetros',
    'Meta democratiza la IA con su modelo más grande hasta la fecha, disponible para uso comercial sin restricciones.',
    'https://example.com/ai-2-' || gen_random_uuid(),
    NOW() - INTERVAL '3 hours',
    'VentureBeat',
    'ai',
    'https://picsum.photos/800/400?random=202',
    TRUE,
    'trending',
    ARRAY['meta', 'llama', 'opensource']
),
(
    'DeepMind resuelve problema matemático del milenio con AlphaProof',
    'AlphaProof de DeepMind resuelve 4 de 6 problemas de la Olimpiada Internacional de Matemáticas.',
    'https://example.com/ai-3-' || gen_random_uuid(),
    NOW() - INTERVAL '4 hours',
    'MIT Technology Review',
    'ai',
    'https://picsum.photos/800/400?random=203',
    TRUE,
    'hot',
    ARRAY['deepmind', 'alphaproof', 'matematicas']
),
(
    'Nvidia presenta chip H200 optimizado para entrenamiento de LLMs',
    'El nuevo chip de Nvidia ofrece 141GB de memoria HBM3e y rendimiento 90% superior al H100.',
    'https://example.com/ai-4-' || gen_random_uuid(),
    NOW() - INTERVAL '5 hours',
    'The Information',
    'ai',
    'https://picsum.photos/800/400?random=204',
    TRUE,
    'high',
    ARRAY['nvidia', 'h200', 'hardware']
),
(
    'Midjourney v6 genera videos fotorrealistas de 60 segundos',
    'La nueva versión de Midjourney genera videos con coherencia temporal y calidad cinematográfica.',
    'https://example.com/ai-5-' || gen_random_uuid(),
    NOW() - INTERVAL '6 hours',
    'AI News',
    'ai',
    'https://picsum.photos/800/400?random=205',
    FALSE,
    'trending',
    ARRAY['midjourney', 'video', 'generative']
),
(
    'OpenAI anuncia GPT Store con más de 3 millones de GPTs',
    'La tienda de aplicaciones de IA de OpenAI supera los $100M en transacciones mensuales.',
    'https://example.com/ai-6-' || gen_random_uuid(),
    NOW() - INTERVAL '7 hours',
    'VentureBeat',
    'ai',
    'https://picsum.photos/800/400?random=206',
    FALSE,
    'medium',
    ARRAY['openai', 'gptstore', 'marketplace']
);

-- CLOUD - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'AWS anuncia región de datos en España para 2025',
    'Amazon Web Services construirá tres centros de datos en Madrid con inversión de €2.5 billones.',
    'https://example.com/cloud-1-' || gen_random_uuid(),
    NOW() - INTERVAL '2 hours',
    'Cloud Computing News',
    'cloud',
    'https://picsum.photos/800/400?random=301',
    TRUE,
    'trending',
    ARRAY['aws', 'españa', 'datacenter']
),
(
    'Azure Container Apps ahora soporta GPUs para workloads de IA',
    'Microsoft añade soporte nativo para NVIDIA A100 y H100 en su plataforma de contenedores serverless.',
    'https://example.com/cloud-2-' || gen_random_uuid(),
    NOW() - INTERVAL '4 hours',
    'The Register',
    'cloud',
    'https://picsum.photos/800/400?random=302',
    TRUE,
    'hot',
    ARRAY['azure', 'gpu', 'containers']
),
(
    'Google Cloud reduce precios de egress en 50% globalmente',
    'Google Cloud elimina cargos de transferencia para clientes migrando desde otros proveedores.',
    'https://example.com/cloud-3-' || gen_random_uuid(),
    NOW() - INTERVAL '6 hours',
    'InfoWorld',
    'cloud',
    'https://picsum.photos/800/400?random=303',
    TRUE,
    'high',
    ARRAY['gcp', 'pricing', 'egress']
),
(
    'Cloudflare Workers supera 3 millones de aplicaciones',
    'La plataforma edge computing de Cloudflare procesa 50 millones de requests por segundo.',
    'https://example.com/cloud-4-' || gen_random_uuid(),
    NOW() - INTERVAL '8 hours',
    'Cloud Computing News',
    'cloud',
    'https://picsum.photos/800/400?random=304',
    FALSE,
    'medium',
    ARRAY['cloudflare', 'edge', 'workers']
);

-- QUANTUM - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'IBM Quantum Network alcanza 1,121 qubits estables',
    'IBM demuestra supremacía cuántica práctica con su procesador Condor de nueva generación.',
    'https://example.com/quantum-1-' || gen_random_uuid(),
    NOW() - INTERVAL '3 hours',
    'Quantum Computing Report',
    'quantum',
    'https://picsum.photos/800/400?random=401',
    TRUE,
    'hot',
    ARRAY['ibm', 'condor', 'qubits']
),
(
    'China logra teleportación cuántica a 1,200 km de distancia',
    'Científicos chinos establecen récord mundial en comunicación cuántica satelital.',
    'https://example.com/quantum-2-' || gen_random_uuid(),
    NOW() - INTERVAL '6 hours',
    'The Quantum Insider',
    'quantum',
    'https://picsum.photos/800/400?random=402',
    TRUE,
    'trending',
    ARRAY['china', 'teleportacion', 'satelite']
),
(
    'Microsoft Azure Quantum resuelve problema de optimización',
    'Azure Quantum resuelve problema de logística con 100,000 variables en 30 segundos.',
    'https://example.com/quantum-3-' || gen_random_uuid(),
    NOW() - INTERVAL '9 hours',
    'Nature Quantum',
    'quantum',
    'https://picsum.photos/800/400?random=403',
    FALSE,
    'high',
    ARRAY['microsoft', 'azure', 'optimizacion']
);

-- FINANCE-CRYPTO - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'Ethereum ETF aprobado por SEC comienza a cotizar',
    'La SEC aprueba 9 ETFs de Ethereum spot que comenzaron a cotizar con volumen récord de $1B.',
    'https://example.com/crypto-1-' || gen_random_uuid(),
    NOW() - INTERVAL '2 hours',
    'CoinDesk',
    'finance-crypto',
    'https://picsum.photos/800/400?random=501',
    TRUE,
    'hot',
    ARRAY['ethereum', 'etf', 'sec']
),
(
    'El Salvador compra 5,000 Bitcoin adicionales',
    'El presidente Bukele anuncia la mayor compra de Bitcoin del país centroamericano.',
    'https://example.com/crypto-2-' || gen_random_uuid(),
    NOW() - INTERVAL '4 hours',
    'CoinTelegraph',
    'finance-crypto',
    'https://picsum.photos/800/400?random=502',
    TRUE,
    'trending',
    ARRAY['bitcoin', 'elsalvador', 'bukele']
),
(
    'PayPal lanza stablecoin PYUSD en Solana',
    'PayPal expande su stablecoin a la blockchain de Solana para reducir fees de transacción.',
    'https://example.com/crypto-3-' || gen_random_uuid(),
    NOW() - INTERVAL '6 hours',
    'The Block',
    'finance-crypto',
    'https://picsum.photos/800/400?random=503',
    TRUE,
    'high',
    ARRAY['paypal', 'pyusd', 'solana']
),
(
    'BlackRock: Bitcoin ETF supera $10B en activos',
    'El fondo de Bitcoin de BlackRock se convierte en el ETF de más rápido crecimiento.',
    'https://example.com/crypto-4-' || gen_random_uuid(),
    NOW() - INTERVAL '8 hours',
    'Decrypt',
    'finance-crypto',
    'https://picsum.photos/800/400?random=504',
    FALSE,
    'medium',
    ARRAY['blackrock', 'bitcoin', 'etf']
);

-- SOFTWARE-DEVOPS - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'GitHub Copilot Workspace: IDE completo en la nube con IA',
    'GitHub revoluciona el desarrollo con un entorno de desarrollo completo potenciado por IA en el navegador.',
    'https://example.com/devops-1-' || gen_random_uuid(),
    NOW() - INTERVAL '100 minutes',
    'InfoQ',
    'software-devops',
    'https://picsum.photos/800/400?random=601',
    TRUE,
    'hot',
    ARRAY['github', 'copilot', 'ide']
),
(
    'Docker Desktop 5.0 incluye Kubernetes integrado',
    'La nueva versión de Docker Desktop incluye un cluster K8s de un nodo para desarrollo local.',
    'https://example.com/devops-2-' || gen_random_uuid(),
    NOW() - INTERVAL '3 hours',
    'DevOps.com',
    'software-devops',
    'https://picsum.photos/800/400?random=602',
    TRUE,
    'trending',
    ARRAY['docker', 'kubernetes', 'desktop']
),
(
    'TypeScript 5.4 añade inferencia de tipos mejorada',
    'Microsoft lanza TypeScript 5.4 con mejoras significativas en el sistema de tipos y performance.',
    'https://example.com/devops-3-' || gen_random_uuid(),
    NOW() - INTERVAL '5 hours',
    'The New Stack',
    'software-devops',
    'https://picsum.photos/800/400?random=603',
    FALSE,
    'medium',
    ARRAY['typescript', 'microsoft', 'javascript']
);

-- IOT - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'Apple HomeKit 3.0 soporta Matter y Thread nativo',
    'Apple actualiza HomeKit con soporte completo para el estándar Matter y protocolo Thread.',
    'https://example.com/iot-1-' || gen_random_uuid(),
    NOW() - INTERVAL '2.5 hours',
    'IoT World Today',
    'iot',
    'https://picsum.photos/800/400?random=701',
    TRUE,
    'trending',
    ARRAY['apple', 'homekit', 'matter']
),
(
    'Samsung SmartThings alcanza 100 millones de dispositivos',
    'La plataforma IoT de Samsung celebra milestone con ecosistema de 5,000 fabricantes.',
    'https://example.com/iot-2-' || gen_random_uuid(),
    NOW() - INTERVAL '5 hours',
    'Stacey on IoT',
    'iot',
    'https://picsum.photos/800/400?random=702',
    TRUE,
    'hot',
    ARRAY['samsung', 'smartthings', 'iot']
),
(
    'ESP32-C6 con WiFi 6 y Bluetooth 5.3 por $3',
    'Espressif lanza el microcontrolador más barato con WiFi 6 del mercado.',
    'https://example.com/iot-3-' || gen_random_uuid(),
    NOW() - INTERVAL '7 hours',
    'IoT World Today',
    'iot',
    'https://picsum.photos/800/400?random=703',
    FALSE,
    'medium',
    ARRAY['esp32', 'wifi6', 'microcontroller']
);

-- DATA-SCIENCE - Noticias adicionales
INSERT INTO news (
    title, description, link, pub_date, source, category, 
    image_url, is_featured, severity, tags
) VALUES 
(
    'Pandas 2.2 es 10x más rápido con backend Arrow',
    'La nueva versión de Pandas utiliza Apache Arrow como backend por defecto mejorando el rendimiento.',
    'https://example.com/data-1-' || gen_random_uuid(),
    NOW() - INTERVAL '3 hours',
    'KDnuggets',
    'data-science',
    'https://picsum.photos/800/400?random=801',
    TRUE,
    'hot',
    ARRAY['pandas', 'arrow', 'python']
),
(
    'Jupyter Notebook ahora con copiloto IA integrado',
    'JupyterLab 4.1 incluye asistente de IA que sugiere código y visualizaciones automáticamente.',
    'https://example.com/data-2-' || gen_random_uuid(),
    NOW() - INTERVAL '6 hours',
    'Towards Data Science',
    'data-science',
    'https://picsum.photos/800/400?random=802',
    FALSE,
    'trending',
    ARRAY['jupyter', 'ia', 'notebook']
),
(
    'Databricks valued at $43B tras ronda Serie J',
    'Databricks se convierte en la startup de data más valiosa del mundo.',
    'https://example.com/data-3-' || gen_random_uuid(),
    NOW() - INTERVAL '9 hours',
    'KDnuggets',
    'data-science',
    'https://picsum.photos/800/400?random=803',
    FALSE,
    'medium',
    ARRAY['databricks', 'funding', 'bigdata']
);

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
ORDER BY "Total" DESC;