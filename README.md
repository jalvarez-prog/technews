# TechHub News Aggregator

Un agregador de noticias tecnológicas en tiempo real con categorías especializadas y ticker de noticias destacadas.

## 🚀 Características

- **8 Categorías Tecnológicas**: Cybersecurity, AI, Fintech/Crypto, Software/DevOps, IoT, Cloud, Data Science, Quantum Computing
- **Ticker en Tiempo Real**: Noticias destacadas con actualización automática
- **Scraper RSS Automatizado**: Recopila noticias de más de 40 fuentes confiables
- **Interfaz Moderna**: Diseño responsive con tema oscuro usando React + Tailwind CSS
- **Base de Datos Supabase**: Almacenamiento escalable y en tiempo real
- **Sistema de Severidad**: Clasificación automática de noticias (Critical, High, Hot, Trending)

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)
- Git

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone git@github.com:jalvarez-prog/technews.git
cd technews
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd backend
npm install
cd ..
```

4. **Configurar variables de entorno**

Copiar los archivos de ejemplo:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Editar ambos archivos `.env` con tus credenciales de Supabase:
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Anon/Public key
- `SUPABASE_SERVICE_KEY`: Service role key (solo backend)

5. **Configurar la base de datos**

Ejecutar las migraciones SQL en Supabase:
```bash
# En el dashboard de Supabase, SQL Editor
# Ejecutar en orden:
supabase/migrations/001_create_news_schema.sql
supabase/migrations/002_security_policies.sql
supabase/migrations/003_cleanup_cron.sql
supabase/migrations/004_automation_cron_jobs.sql
```

## 🚀 Ejecución

### Desarrollo

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (scraper)
npm run dev:backend
```

### Producción

```bash
# Build del frontend
npm run build

# Servir archivos estáticos
npm run preview

# Backend en producción
cd backend
NODE_ENV=production node server.js
```

## 📁 Estructura del Proyecto

```
technews/
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes React
│   ├── config/            # Configuraciones (categorías, feeds RSS)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Librerías (Supabase client)
│   ├── services/          # Servicios (analytics)
│   └── types/             # TypeScript types
├── backend/               # Servidor Node.js
│   ├── services/          # Scrapers y cron jobs
│   ├── server.js          # Entry point
│   └── package.json       # Dependencias backend
├── supabase/              # SQL migrations
│   └── migrations/        # Scripts de base de datos
├── scripts/               # Scripts utilitarios
└── public/                # Assets estáticos
```

## 🔄 Cron Jobs

El backend ejecuta automáticamente:
- **RSS Scraping**: Cada 30 minutos
- **Quick Update**: Cada 10 minutos (categorías críticas)
- **Stats Update**: Cada hora
- **Cleanup**: Diariamente a las 3:00 AM

## 🗄️ Base de Datos

### Tablas principales:
- `news`: Almacena todas las noticias
- `feed_updates`: Tracking de feeds RSS
- `category_stats`: Estadísticas por categoría
- `cron_logs`: Logs de ejecución

## 🔧 Scripts Útiles

```bash
# Verificar conexión a Supabase
node backend/checkSupabase.js

# Ejecutar scraper manualmente
node backend/server.js run rss

# Ver últimas noticias
node backend/checkLatestNews.js

# Actualizar ticker
node backend/updateTicker.js
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Conectar repositorio
2. Configurar variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Backend (Railway/Render)
1. Conectar repositorio
2. Configurar variables de entorno
3. Start command: `cd backend && npm start`
4. Asegurar que los cron jobs estén habilitados

## 📝 Licencia

MIT License - ver archivo LICENSE

## 👥 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 🐛 Reporte de Bugs

Abrir un issue en GitHub con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots (si aplica)

## 📞 Contacto

Jose Alvarez - [@jalvarez-prog](https://github.com/jalvarez-prog)

Link del proyecto: [https://github.com/jalvarez-prog/technews](https://github.com/jalvarez-prog/technews)