import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import v1Routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allows loading local fonts, audio, and media previews
  })
);

// CORS configuration supporting frontend dev server and production (Vercel)
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow all Vercel deployment URLs (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Permissive in development or if CLIENT_URL matches
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static Media Serving with cross-origin headers for Vercel -> Render media fetching
const mediaCorsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
};

const potentialUploadDirs = [
  config.paths.uploads,
  path.join(config.paths.server, 'public/uploads'),
  path.join(config.paths.root, 'public/uploads'),
  config.paths.legacyUploads
];

potentialUploadDirs.forEach((dir) => {
  if (dir && fs.existsSync(dir)) {
    app.use('/uploads', mediaCorsMiddleware, express.static(dir));
  }
});

// Client build static serving for production single-port deployment
const clientDistPath = path.join(config.paths.root, 'client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// API Routes
app.use('/api/v1', v1Routes);

// Health check endpoints for uptime monitoring and keep-alive
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'Islamic Birthday Surprise API'
  });
};

app.get('/api/v1/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// SPA fallback for production when client is built
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized error handler
app.use(errorHandler);

export default app;
