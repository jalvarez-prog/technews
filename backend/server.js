// Cargar variables de entorno
require('dotenv').config();

const { startAllJobs, runJobManually } = require('./services/cronJobService');

console.log('=================================');
console.log('TechHub RSS Scraper Cron Server');
console.log('=================================\n');

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length > 0) {
  // Modo manual: ejecutar un job específico
  const command = args[0];
  
  if (command === 'run') {
    const jobName = args[1];
    if (jobName) {
      console.log(`Running ${jobName} job manually...`);
      runJobManually(jobName).then(() => {
        console.log('Job completed');
        process.exit(0);
      }).catch(error => {
        console.error('Job failed:', error);
        process.exit(1);
      });
    } else {
      console.error('Please specify a job name: rss, cleanup, quick, or stats');
      process.exit(1);
    }
  } else {
    console.error('Unknown command:', command);
    console.log('Usage:');
    console.log('  node server.js              - Start all cron jobs');
    console.log('  node server.js run <job>    - Run a specific job manually');
    console.log('Available jobs: rss, cleanup, quick, stats');
    process.exit(1);
  }
} else {
  // Modo servidor: iniciar todos los cron jobs
  console.log('Starting cron server...\n');
  
  // Iniciar todos los jobs
  startAllJobs();
  
  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT, shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\nReceived SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
  
  console.log('\nCron server is running. Press Ctrl+C to stop.');
  console.log('\nScheduled Jobs:');
  console.log('- RSS Scraping: Every 30 minutes');
  console.log('- Quick Update: Every 10 minutes (critical categories only)');
  console.log('- Stats Update: Every hour');
  console.log('- Cleanup: Daily at 3:00 AM\n');
}