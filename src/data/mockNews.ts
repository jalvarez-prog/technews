import { NewsArticle, NewsCategory } from '../types';

const generateMockArticle = (
  category: NewsCategory,
  index: number,
  title: string,
  description: string,
  source: string,
  link?: string
): NewsArticle => ({
  id: `${category}-mock-${index}`,
  title,
  description,
  link: link || '', // Let the link utilities handle the fallback
  pubDate: new Date(Date.now() - index * 3600000).toISOString(),
  source,
  category,
  imageUrl: `https://picsum.photos/400/300?random=${category}-${index}`
});

export const mockNewsByCategory: Record<NewsCategory, NewsArticle[]> = {
  'cybersecurity': [
    generateMockArticle(
      'cybersecurity',
      1,
      'Nueva vulnerabilidad crítica descubierta en sistemas Windows',
      'Microsoft ha lanzado un parche de emergencia para corregir una vulnerabilidad de día cero que afecta a todas las versiones de Windows.',
      'The Hacker News',
      'https://thehackernews.com'
    ),
    generateMockArticle(
      'cybersecurity',
      2,
      'Ransomware ataca a empresa Fortune 500',
      'Un grupo de hackers ha comprometido los sistemas de una importante corporación, exigiendo un rescate millonario.',
      'Dark Reading',
      'https://www.darkreading.com'
    ),
    generateMockArticle(
      'cybersecurity',
      3,
      'Guía completa: Cómo proteger tu empresa contra ataques de phishing',
      'Los expertos comparten las mejores prácticas para identificar y prevenir ataques de phishing en entornos corporativos.',
      'Bleeping Computer',
      'https://www.bleepingcomputer.com'
    ),
  ],

  'ai': [
    generateMockArticle(
      'ai',
      1,
      'OpenAI lanza GPT-5: El modelo más avanzado hasta la fecha',
      'La nueva versión promete capacidades de razonamiento mejoradas y mayor comprensión del contexto.',
      'AI News',
      'https://venturebeat.com/ai'
    ),
    generateMockArticle(
      'ai',
      2,
      'Google DeepMind revoluciona la predicción del clima con IA',
      'Un nuevo modelo de inteligencia artificial puede predecir el clima con 10 días de anticipación con precisión sin precedentes.',
      'Synced Review',
      'https://syncedreview.com'
    ),
    generateMockArticle(
      'ai',
      3,
      'IA generativa transforma la industria del diseño gráfico',
      'Las herramientas de IA están cambiando radicalmente cómo los diseñadores abordan su trabajo creativo.',
      'AI News',
      'https://www.artificialintelligence-news.com'
    ),
  ],

  'finance-crypto': [
    generateMockArticle(
      'finance-crypto',
      1,
      'Bitcoin alcanza nuevo máximo histórico superando los $100,000',
      'La criptomoneda líder rompe barreras mientras la adopción institucional continúa creciendo.',
      'CoinTelegraph',
      'https://cointelegraph.com'
    ),
    generateMockArticle(
      'finance-crypto',
      2,
      'Ethereum 3.0: Todo lo que necesitas saber sobre la actualización',
      'La próxima gran actualización de Ethereum promete mejorar la escalabilidad y reducir las tarifas de gas.',
      'CoinDesk',
      'https://www.coindesk.com'
    ),
    generateMockArticle(
      'finance-crypto',
      3,
      'Bancos centrales aceleran desarrollo de monedas digitales',
      'Más de 50 países están explorando activamente las CBDCs como el futuro del dinero digital.',
      'CoinTelegraph',
      'https://cointelegraph.com'
    ),
  ],

  'software-devops': [
    generateMockArticle(
      'software-devops',
      1,
      'Kubernetes 2.0: Nueva versión con características revolucionarias',
      'La comunidad de Kubernetes lanza una actualización mayor con mejoras significativas en seguridad y rendimiento.',
      'InfoQ',
      'https://www.infoq.com'
    ),
    generateMockArticle(
      'software-devops',
      2,
      'GitHub Copilot X: IA para desarrollo más allá del código',
      'La nueva versión integra capacidades de chat, documentación automática y revisión de pull requests.',
      'DevOps.com',
      'https://devops.com'
    ),
    generateMockArticle(
      'software-devops',
      3,
      'Rust supera a C++ en proyectos de sistemas críticos',
      'Grandes empresas tecnológicas están migrando sus sistemas críticos a Rust por su seguridad de memoria.',
      'InfoQ',
      'https://www.infoq.com'
    ),
  ],

  'iot': [
    generateMockArticle(
      'iot',
      1,
      'Matter 2.0: El estándar que unificará todos los dispositivos IoT',
      'La nueva versión del protocolo promete compatibilidad universal entre todos los dispositivos inteligentes del hogar.',
      'IoT Analytics',
      'https://iot-analytics.com'
    ),
    generateMockArticle(
      'iot',
      2,
      '5G impulsa adopción masiva de IoT industrial',
      'Las redes 5G están permitiendo casos de uso de IoT previamente imposibles en manufactura y logística.',
      'IoT For All',
      'https://www.iotforall.com'
    ),
    generateMockArticle(
      'iot',
      3,
      'Sensores cuánticos revolucionan la agricultura inteligente',
      'Nueva generación de sensores permite monitoreo en tiempo real con precisión sin precedentes.',
      'IoT Analytics',
      'https://iot-analytics.com'
    ),
  ],

  'cloud': [
    generateMockArticle(
      'cloud',
      1,
      'AWS lanza servicios de computación cuántica en la nube',
      'Amazon Web Services hace accesible la computación cuántica a desarrolladores de todo el mundo.',
      'Cloud Computing News',
      'https://cloudcomputing-news.net'
    ),
    generateMockArticle(
      'cloud',
      2,
      'Multi-cloud se convierte en el estándar empresarial',
      'El 87% de las empresas Fortune 500 ahora utilizan estrategias multi-cloud para evitar vendor lock-in.',
      'AWS Blog',
      'https://aws.amazon.com/blogs'
    ),
    generateMockArticle(
      'cloud',
      3,
      'Edge computing: El futuro de la computación distribuida',
      'Las aplicaciones de baja latencia impulsan la adopción masiva de edge computing.',
      'Cloud Computing News',
      'https://cloudcomputing-news.net'
    ),
  ],

  'data-science': [
    generateMockArticle(
      'data-science',
      1,
      'AutoML democratiza el machine learning para todos',
      'Las plataformas de AutoML permiten a no expertos crear modelos de ML sofisticados.',
      'KDnuggets',
      'https://www.kdnuggets.com'
    ),
    generateMockArticle(
      'data-science',
      2,
      'Graph Neural Networks: La próxima frontera en IA',
      'Los GNNs están revolucionando el análisis de redes sociales y descubrimiento de fármacos.',
      'Towards Data Science',
      'https://towardsdatascience.com'
    ),
    generateMockArticle(
      'data-science',
      3,
      'Python 4.0: Optimizado para ciencia de datos',
      'La nueva versión promete mejoras de rendimiento del 300% en operaciones numéricas.',
      'KDnuggets',
      'https://www.kdnuggets.com'
    ),
  ],

  'quantum': [
    generateMockArticle(
      'quantum',
      1,
      'IBM alcanza 1000 qubits con su nuevo procesador cuántico',
      'El hito marca el comienzo de la era de la computación cuántica práctica.',
      'The Quantum Insider',
      'https://thequantuminsider.com'
    ),
    generateMockArticle(
      'quantum',
      2,
      'Algoritmo cuántico resuelve problema de optimización imposible',
      'Investigadores demuestran supremacía cuántica en problemas de logística del mundo real.',
      'The Quantum Insider',
      'https://thequantuminsider.com'
    ),
    generateMockArticle(
      'quantum',
      3,
      'Criptografía post-cuántica: Preparándose para la amenaza cuántica',
      'NIST finaliza estándares de encriptación resistentes a computadoras cuánticas.',
      'The Quantum Insider',
      'https://thequantuminsider.com'
    ),
  ],
};