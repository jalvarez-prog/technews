import { CategoryConfig } from '../types';
import { Shield, Brain, TrendingUp, Code, Wifi, Cloud, BarChart3, Atom } from 'lucide-react';

export const categories: CategoryConfig[] = [
  {
    id: 'cybersecurity',
    name: 'Ciberseguridad',
    icon: Shield,
    color: '#DC2626',
    feeds: [
      'https://feeds.feedburner.com/TheHackersNews',
      'https://www.darkreading.com/rss.xml',
      'https://www.bleepingcomputer.com/feed/'
    ]
  },
  {
    id: 'ai',
    name: 'Inteligencia Artificial',
    icon: Brain,
    color: '#7C3AED',
    feeds: [
      'https://www.artificialintelligence-news.com/feed/',
      'https://syncedreview.com/feed/'
    ]
  },
  {
    id: 'finance-crypto',
    name: 'Finanzas y Criptomonedas',
    icon: TrendingUp,
    color: '#059669',
    feeds: [
      'https://cointelegraph.com/rss',
      'https://www.coindesk.com/arc/outboundfeeds/rss/'
    ]
  },
  {
    id: 'software-devops',
    name: 'Desarrollo y DevOps',
    icon: Code,
    color: '#2563EB',
    feeds: [
      'https://www.infoq.com/feed',
      'https://devops.com/feed/'
    ]
  },
  {
    id: 'iot',
    name: 'Internet de las Cosas',
    icon: Wifi,
    color: '#EA580C',
    feeds: [
      'https://iot-analytics.com/feed/',
      'https://www.iotforall.com/feed'
    ]
  },
  {
    id: 'cloud',
    name: 'Computación en la Nube',
    icon: Cloud,
    color: '#0891B2',
    feeds: [
      'https://www.cloudcomputing-news.net/feed/',
      'https://aws.amazon.com/blogs/aws/feed/'
    ]
  },
  {
    id: 'data-science',
    name: 'Análisis y Ciencia de Datos',
    icon: BarChart3,
    color: '#DB2777',
    feeds: [
      'https://www.kdnuggets.com/feed',
      'https://towardsdatascience.com/feed'
    ]
  },
  {
    id: 'quantum',
    name: 'Computación Cuántica',
    icon: Atom,
    color: '#7C3AED',
    feeds: [
      'https://thequantuminsider.com/feed/'
    ]
  }
];
