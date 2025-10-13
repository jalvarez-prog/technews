import { CategoryConfig } from '../types';

// Configuración de feeds RSS - 5 fuentes confiables y gratuitas por categoría
export const rssFeedsConfig: Record<string, string[]> = {
  'cybersecurity': [
    'https://feeds.feedburner.com/TheHackersNews',         // The Hacker News
    'https://www.darkreading.com/rss.xml',                  // Dark Reading
    'https://www.bleepingcomputer.com/feed/',               // Bleeping Computer
    'https://krebsonsecurity.com/feed/',                    // Krebs on Security
    'https://www.schneier.com/blog/atom.xml'                // Schneier on Security
  ],
  'ai': [
    'https://www.artificialintelligence-news.com/feed/',   // AI News
    'https://syncedreview.com/feed/',                       // Synced Review
    'https://venturebeat.com/ai/feed/',                     // VentureBeat AI
    'https://www.marktechpost.com/feed/',                   // MarkTechPost
    'https://thegradient.pub/rss/'                          // The Gradient
  ],
  'finance-crypto': [
    'https://cointelegraph.com/rss',                        // Cointelegraph
    'https://www.coindesk.com/arc/outboundfeeds/rss/',      // CoinDesk
    'https://bitcoinmagazine.com/feed',                     // Bitcoin Magazine
    'https://decrypt.co/feed',                              // Decrypt
    'https://cryptonews.com/news/feed/'                     // CryptoNews
  ],
  'software-devops': [
    'https://www.infoq.com/feed',                          // InfoQ
    'https://devops.com/feed/',                            // DevOps.com
    'https://dzone.com/feeds/rss/all/',                    // DZone
    'https://sdtimes.com/feed/',                           // SD Times
    'https://thenewstack.io/feed/'                         // The New Stack
  ],
  'iot': [
    'https://iot-analytics.com/feed/',                     // IoT Analytics
    'https://www.iotforall.com/feed',                      // IoT For All
    'https://www.iotworld.com/feed/',                      // IoT World
    'https://www.iotworldtoday.com/feed/',                 // IoT World Today
    'https://staceyoniot.com/feed/'                        // Stacey on IoT
  ],
  'cloud': [
    'https://www.cloudcomputing-news.net/feed/',           // CloudTech
    'https://aws.amazon.com/blogs/aws/feed/',              // AWS Blog
    'https://cloudplatform.googleblog.com/feeds/posts/default', // Google Cloud
    'https://azure.microsoft.com/en-us/blog/feed/',        // Azure Blog
    'https://www.ibm.com/blogs/cloud-computing/feed/'      // IBM Cloud
  ],
  'data-science': [
    'https://www.kdnuggets.com/feed',                      // KDnuggets
    'https://towardsdatascience.com/feed',                 // Towards Data Science
    'https://www.datasciencecentral.com/feed/',            // Data Science Central
    'https://analyticsindiamag.com/feed/',                 // Analytics India
    'https://www.datacamp.com/community/rss.xml'           // DataCamp
  ],
  'quantum': [
    'https://thequantuminsider.com/feed/',                 // Quantum Insider
    'https://quantumcomputingreport.com/feed/',            // Quantum Computing Report
    'https://www.quantamagazine.org/feed/',                // Quanta Magazine
    'https://physicsworld.com/feed/',                      // Physics World
    'https://www.nature.com/subjects/quantum-physics.rss'  // Nature Quantum
  ]
};

// Mapeo de categorías a feeds (para compatibilidad con el código existente)
export const feedsByCategory = rssFeedsConfig;

// Total de feeds configurados
export const TOTAL_FEEDS = Object.values(rssFeedsConfig).flat().length;

// Validar que cada categoría tiene exactamente 5 feeds
export function validateFeedsConfig(): boolean {
  for (const [category, feeds] of Object.entries(rssFeedsConfig)) {
    if (feeds.length !== 5) {
      console.error(`Category ${category} does not have exactly 5 feeds (has ${feeds.length})`);
      return false;
    }
  }
  return true;
}