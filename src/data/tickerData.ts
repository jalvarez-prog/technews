import { NewsCategory } from '../types';

interface TickerNewsItem {
  id: number;
  title: string;
  category: string;
  severity: string;
  source: string;
  time: string;
  icon: string;
  link?: string;
}

const tickerDataByCategory: Record<NewsCategory, TickerNewsItem[]> = {
  'cybersecurity': [
    {
      id: 1,
      title: "Zero-Day crítico en Apache Server explotado activamente",
      category: "Zero-Day",
      severity: "critical",
      source: "SecurityWeek",
      time: "1h",
      icon: "🔴",
      link: "https://www.securityweek.com"
    },
    {
      id: 2,
      title: "Grupo ransomware filtra 2TB de datos sanitarios",
      category: "Ransomware",
      severity: "high",
      source: "The Hacker News",
      time: "3h",
      icon: "⚠️",
      link: "https://thehackernews.com"
    },
    {
      id: 3,
      title: "Nuevo malware apunta a wallets de criptomonedas",
      category: "Malware",
      severity: "high",
      source: "Bleeping Computer",
      time: "5h",
      icon: "🔸",
      link: "https://www.bleepingcomputer.com"
    },
    {
      id: 4,
      title: "Grupo APT patrocinado por estado ataca redes gubernamentales",
      category: "APT",
      severity: "critical",
      source: "CyberScoop",
      time: "8h",
      icon: "🔴",
      link: "https://cyberscoop.com"
    },
    {
      id: 5,
      title: "Microsoft lanza parches críticos del Patch Tuesday",
      category: "Patch",
      severity: "medium",
      source: "Microsoft Security",
      time: "12h",
      icon: "🔹",
      link: "https://msrc.microsoft.com/update-guide"
    },
    {
      id: 6,
      title: "Campaña de phishing suplanta a grandes bancos",
      category: "Phishing",
      severity: "high",
      source: "Krebs on Security",
      time: "16h",
      icon: "⚠️",
      link: "https://krebsonsecurity.com"
    }
  ],
  'ai': [
    {
      id: 1,
      title: "OpenAI lanza GPT-5 con capacidades multimodales avanzadas",
      category: "LLM",
      severity: "hot",
      source: "OpenAI Blog",
      time: "2h",
      icon: "🚀",
      link: "https://openai.com/blog"
    },
    {
      id: 2,
      title: "Google DeepMind resuelve problema matemático de 50 años",
      category: "Research",
      severity: "trending",
      source: "Nature",
      time: "4h",
      icon: "🧠",
      link: "https://www.nature.com"
    },
    {
      id: 3,
      title: "Nueva regulación de IA en la UE entra en vigor",
      category: "Regulación",
      severity: "high",
      source: "TechCrunch",
      time: "6h",
      icon: "⚖️",
      link: "https://techcrunch.com"
    },
    {
      id: 4,
      title: "Meta lanza modelo de IA open-source que supera a GPT-4",
      category: "Open Source",
      severity: "hot",
      source: "Meta AI",
      time: "8h",
      icon: "🔥",
      link: "https://ai.meta.com"
    },
    {
      id: 5,
      title: "Anthropic asegura $2B en financiación para Claude 4",
      category: "Inversión",
      severity: "trending",
      source: "Reuters",
      time: "10h",
      icon: "💰",
      link: "https://www.reuters.com"
    },
    {
      id: 6,
      title: "IBM presenta chip neuromórfico de 400% mayor eficiencia",
      category: "Hardware",
      severity: "medium",
      source: "IEEE Spectrum",
      time: "14h",
      icon: "🔬",
      link: "https://spectrum.ieee.org"
    }
  ],
  'finance-crypto': [
    {
      id: 1,
      title: "Bitcoin alcanza nuevo máximo histórico de $75,000",
      category: "Bitcoin",
      severity: "hot",
      source: "CoinDesk",
      time: "30m",
      icon: "₿",
      link: "https://www.coindesk.com"
    },
    {
      id: 2,
      title: "SEC aprueba primer ETF de Ethereum en EE.UU.",
      category: "ETF",
      severity: "trending",
      source: "Bloomberg",
      time: "2h",
      icon: "📈",
      link: "https://www.bloomberg.com"
    },
    {
      id: 3,
      title: "DeFi protocol pierde $50M en hack de smart contract",
      category: "DeFi",
      severity: "critical",
      source: "The Block",
      time: "4h",
      icon: "🔴",
      link: "https://www.theblock.co"
    },
    {
      id: 4,
      title: "JPMorgan lanza plataforma de tokenización de activos",
      category: "TradFi",
      severity: "trending",
      source: "Financial Times",
      time: "6h",
      icon: "🏦",
      link: "https://www.ft.com"
    },
    {
      id: 5,
      title: "Binance alcanza acuerdo de $4.3B con el DOJ",
      category: "Exchange",
      severity: "high",
      source: "Reuters",
      time: "8h",
      icon: "⚖️",
      link: "https://www.reuters.com"
    },
    {
      id: 6,
      title: "Layer 2 de Ethereum procesa más transacciones que mainnet",
      category: "Layer 2",
      severity: "medium",
      source: "L2Beat",
      time: "12h",
      icon: "⚡",
      link: "https://l2beat.com"
    }
  ],
  'software-devops': [
    {
      id: 1,
      title: "Kubernetes 1.30 lanza soporte nativo para WebAssembly",
      category: "K8s",
      severity: "hot",
      source: "CNCF",
      time: "3h",
      icon: "☸️",
      link: "https://www.cncf.io"
    },
    {
      id: 2,
      title: "GitHub Copilot X integra debugging automático con IA",
      category: "AI Tools",
      severity: "trending",
      source: "GitHub Blog",
      time: "5h",
      icon: "🤖",
      link: "https://github.blog"
    },
    {
      id: 3,
      title: "Rust supera a C++ en índice de popularidad TIOBE",
      category: "Languages",
      severity: "trending",
      source: "TIOBE",
      time: "7h",
      icon: "🦀",
      link: "https://www.tiobe.com"
    },
    {
      id: 4,
      title: "Docker Desktop añade soporte para Apple Silicon M3",
      category: "Containers",
      severity: "medium",
      source: "Docker Blog",
      time: "9h",
      icon: "🐳",
      link: "https://www.docker.com/blog"
    },
    {
      id: 5,
      title: "Terraform 2.0 introduce estado distribuido nativo",
      category: "IaC",
      severity: "high",
      source: "HashiCorp",
      time: "11h",
      icon: "🔧",
      link: "https://www.hashicorp.com"
    },
    {
      id: 6,
      title: "GitLab adquiere herramienta de seguridad DevSecOps",
      category: "DevSecOps",
      severity: "medium",
      source: "GitLab",
      time: "15h",
      icon: "🔒",
      link: "https://about.gitlab.com"
    }
  ],
  'iot': [
    {
      id: 1,
      title: "Matter 2.0 añade soporte para electrodomésticos inteligentes",
      category: "Standards",
      severity: "trending",
      source: "CSA",
      time: "2h",
      icon: "🏠",
      link: "https://csa-iot.org"
    },
    {
      id: 2,
      title: "Bosch lanza sensores IoT con 10 años de batería",
      category: "Hardware",
      severity: "hot",
      source: "IoT World",
      time: "4h",
      icon: "🔋",
      link: "https://www.iot-world.com"
    },
    {
      id: 3,
      title: "Vulnerabilidad crítica en routers IoT afecta a millones",
      category: "Security",
      severity: "critical",
      source: "Ars Technica",
      time: "6h",
      icon: "🚨",
      link: "https://arstechnica.com"
    },
    {
      id: 4,
      title: "Amazon Sidewalk alcanza cobertura del 90% en EE.UU.",
      category: "Networks",
      severity: "medium",
      source: "Amazon News",
      time: "8h",
      icon: "📡",
      link: "https://www.aboutamazon.com"
    },
    {
      id: 5,
      title: "Edge AI reduce latencia IoT en 75% según estudio",
      category: "Edge Computing",
      severity: "trending",
      source: "IEEE IoT",
      time: "10h",
      icon: "⚡",
      link: "https://iot.ieee.org"
    },
    {
      id: 6,
      title: "5G privado impulsa adopción industrial de IoT",
      category: "5G",
      severity: "medium",
      source: "Light Reading",
      time: "14h",
      icon: "📶",
      link: "https://www.lightreading.com"
    }
  ],
  'cloud': [
    {
      id: 1,
      title: "AWS lanza instancias con chips Graviton4 de 30% más rendimiento",
      category: "AWS",
      severity: "hot",
      source: "AWS Blog",
      time: "1h",
      icon: "☁️",
      link: "https://aws.amazon.com/blogs"
    },
    {
      id: 2,
      title: "Azure sufre interrupción global de 4 horas",
      category: "Azure",
      severity: "critical",
      source: "The Register",
      time: "3h",
      icon: "🔴",
      link: "https://www.theregister.com"
    },
    {
      id: 3,
      title: "Google Cloud reduce precios de almacenamiento en 25%",
      category: "GCP",
      severity: "trending",
      source: "Google Cloud",
      time: "5h",
      icon: "💰",
      link: "https://cloud.google.com/blog"
    },
    {
      id: 4,
      title: "Cloudflare lanza servicio de IA serverless global",
      category: "Edge",
      severity: "trending",
      source: "Cloudflare Blog",
      time: "7h",
      icon: "🌐",
      link: "https://blog.cloudflare.com"
    },
    {
      id: 5,
      title: "Multi-cloud adoption alcanza 87% en empresas Fortune 500",
      category: "Trends",
      severity: "medium",
      source: "Gartner",
      time: "9h",
      icon: "📊",
      link: "https://www.gartner.com"
    },
    {
      id: 6,
      title: "FinOps reduce costos cloud en 30% promedio según estudio",
      category: "FinOps",
      severity: "medium",
      source: "FinOps Foundation",
      time: "13h",
      icon: "📉",
      link: "https://www.finops.org"
    }
  ],
  'data-science': [
    {
      id: 1,
      title: "Apache Spark 4.0 mejora procesamiento ML en 3x",
      category: "Big Data",
      severity: "hot",
      source: "Databricks",
      time: "2h",
      icon: "⚡",
      link: "https://databricks.com"
    },
    {
      id: 2,
      title: "Pandas 3.0 introduce backend GPU nativo",
      category: "Python",
      severity: "trending",
      source: "PyData",
      time: "4h",
      icon: "🐼",
      link: "https://pydata.org"
    },
    {
      id: 3,
      title: "Snowflake adquiere startup de feature store por $800M",
      category: "Data Platform",
      severity: "trending",
      source: "TechCrunch",
      time: "6h",
      icon: "❄️",
      link: "https://techcrunch.com"
    },
    {
      id: 4,
      title: "MLOps: El 70% de modelos no llegan a producción",
      category: "MLOps",
      severity: "high",
      source: "VentureBeat",
      time: "8h",
      icon: "📈",
      link: "https://venturebeat.com"
    },
    {
      id: 5,
      title: "dbt Labs lanza orquestador de pipelines de datos",
      category: "DataOps",
      severity: "medium",
      source: "dbt Blog",
      time: "10h",
      icon: "🔄",
      link: "https://blog.getdbt.com"
    },
    {
      id: 6,
      title: "Vector databases ven adopción del 400% en 2024",
      category: "Databases",
      severity: "trending",
      source: "DB-Engines",
      time: "14h",
      icon: "🗃️",
      link: "https://db-engines.com"
    }
  ],
  'quantum': [
    {
      id: 1,
      title: "IBM alcanza 1000 qubits con procesador Condor",
      category: "Hardware",
      severity: "hot",
      source: "IBM Research",
      time: "3h",
      icon: "⚛️",
      link: "https://research.ibm.com"
    },
    {
      id: 2,
      title: "Google demuestra supremacía cuántica en problema real",
      category: "Research",
      severity: "trending",
      source: "Nature",
      time: "5h",
      icon: "🔬",
      link: "https://www.nature.com"
    },
    {
      id: 3,
      title: "Algoritmo cuántico rompe encriptación RSA-2048 en teoría",
      category: "Cryptography",
      severity: "critical",
      source: "Quantum Computing Report",
      time: "7h",
      icon: "🔓",
      link: "https://quantumcomputingreport.com"
    },
    {
      id: 4,
      title: "Microsoft Azure Quantum añade simulador de 1M qubits",
      category: "Cloud",
      severity: "medium",
      source: "Microsoft",
      time: "9h",
      icon: "☁️",
      link: "https://www.microsoft.com"
    },
    {
      id: 5,
      title: "Startup logra corrección de errores cuánticos al 99.9%",
      category: "Error Correction",
      severity: "trending",
      source: "Physics World",
      time: "11h",
      icon: "✅",
      link: "https://physicsworld.com"
    },
    {
      id: 6,
      title: "China invierte $15B en computación cuántica nacional",
      category: "Investment",
      severity: "high",
      source: "South China Post",
      time: "15h",
      icon: "💰",
      link: "https://www.scmp.com"
    }
  ]
};

export function getTickerDataForCategory(category: NewsCategory): TickerNewsItem[] {
  return tickerDataByCategory[category] || [];
}