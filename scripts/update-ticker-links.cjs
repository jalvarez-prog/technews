// Script to add missing links to ticker data
const fs = require('fs');
const path = require('path');

// Map of sources to their corresponding URLs
const sourceUrls = {
  'SecurityWeek': 'https://www.securityweek.com',
  'The Hacker News': 'https://thehackernews.com',
  'Bleeping Computer': 'https://www.bleepingcomputer.com',
  'CyberScoop': 'https://cyberscoop.com',
  'Microsoft Security': 'https://msrc.microsoft.com',
  'Krebs on Security': 'https://krebsonsecurity.com',
  'OpenAI Blog': 'https://openai.com/blog',
  'Nature': 'https://www.nature.com',
  'TechCrunch': 'https://techcrunch.com',
  'Meta AI': 'https://ai.meta.com',
  'Reuters': 'https://www.reuters.com',
  'IEEE Spectrum': 'https://spectrum.ieee.org',
  'CoinDesk': 'https://www.coindesk.com',
  'Bloomberg': 'https://www.bloomberg.com',
  'The Block': 'https://www.theblock.co',
  'Financial Times': 'https://www.ft.com',
  'L2Beat': 'https://l2beat.com',
  'CNCF': 'https://www.cncf.io',
  'GitHub Blog': 'https://github.blog',
  'TIOBE': 'https://www.tiobe.com',
  'Docker Blog': 'https://www.docker.com/blog',
  'HashiCorp': 'https://www.hashicorp.com',
  'GitLab': 'https://about.gitlab.com',
  'CSA': 'https://csa-iot.org',
  'IoT World': 'https://www.iot-world.com',
  'Ars Technica': 'https://arstechnica.com',
  'Amazon News': 'https://www.aboutamazon.com',
  'IEEE IoT': 'https://iot.ieee.org',
  'Light Reading': 'https://www.lightreading.com',
  'AWS Blog': 'https://aws.amazon.com/blogs',
  'The Register': 'https://www.theregister.com',
  'Google Cloud': 'https://cloud.google.com/blog',
  'Cloudflare Blog': 'https://blog.cloudflare.com',
  'Gartner': 'https://www.gartner.com',
  'FinOps Foundation': 'https://www.finops.org',
  'Databricks': 'https://databricks.com',
  'PyData': 'https://pydata.org',
  'VentureBeat': 'https://venturebeat.com',
  'dbt Blog': 'https://blog.getdbt.com',
  'DB-Engines': 'https://db-engines.com',
  'IBM Research': 'https://research.ibm.com',
  'Quantum Computing Report': 'https://quantumcomputingreport.com',
  'Microsoft': 'https://www.microsoft.com',
  'Physics World': 'https://physicsworld.com',
  'South China Post': 'https://www.scmp.com'
};

// Read the ticker data file
const filePath = path.join(__dirname, '../src/data/tickerData.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

// Process each source mapping
Object.entries(sourceUrls).forEach(([source, url]) => {
  // Find patterns like source: "SourceName" without a link field following it
  const pattern = new RegExp(`(source: "${source}",\\s*time: "[^"]+",\\s*icon: "[^"]+")(?!\\s*,\\s*link:)`, 'g');
  
  fileContent = fileContent.replace(pattern, `$1,\n      link: "${url}"`);
});

// Write the updated content back
fs.writeFileSync(filePath, fileContent);

console.log('✅ Ticker data links updated successfully!');
console.log('Please review the changes before committing.');