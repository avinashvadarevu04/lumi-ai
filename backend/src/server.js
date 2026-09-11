import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { prisma, disconnectPrisma } from './lib/prisma.js';
import { attachAuth } from './middleware/authGuard.js';
import { originGuard } from './middleware/originGuard.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';
import projectsRouter from './routes/projects.js';
import telemetryRouter from './routes/telemetry.js';
import auditRouter from './routes/audit.js';
import dashboardRouter from './routes/dashboard.js';
import contactRouter from './routes/contact.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* ------------------------------------------------------------------ */
/*  Platform                                                           */
/* ------------------------------------------------------------------ */

// Governs how req.ip is derived. Must match the real deployment topology:
// an over-permissive value lets clients spoof IPs and defeat rate limiting.
app.set('trust proxy', env.trustProxy);
app.disable('x-powered-by');

app.use(
  helmet({
    // The API returns JSON only; a CSP here would not protect anything and the
    // front end sets its own. Cross-origin isolation headers are kept.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: env.isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);

/**
 * Strict, credentialed CORS. An unknown origin simply receives no
 * Access-Control-Allow-Origin header, so the browser blocks the response.
 * Rejecting with an Error instead would surface as a 500 and, worse, would
 * turn a blocked cross-origin read into a server error in the logs.
 * State-changing requests are additionally stopped by `originGuard` below.
 */
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // curl, health probes, server-to-server
    const normalised = origin.replace(/\/$/, '');
    if (env.allowedOrigins.includes(normalised)) return callback(null, true);
    if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalised)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 600,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false, limit: '256kb' }));
app.use(cookieParser());

if (!env.isProduction && !env.isTest) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[http] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

app.use('/api', apiLimiter);
app.use('/api', attachAuth); // populates req.auth when a valid session exists
app.use('/api', originGuard); // CSRF defence for every state-changing call

app.get('/api', (_req, res) => {
  res.json({
    service: 'Lupus AI Labs API',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      leads: 'POST /api/leads (public) · GET /api/leads (admin)',
      projects: 'GET /api/projects (public) · POST|PATCH|DELETE (admin)',
      telemetry: 'POST /api/telemetry (public)',
      auth: 'POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me',
    },
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/audit', auditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/contact', contactRouter); // legacy alias

/* ------------------------------------------------------------------ */
/*  Optional single-origin hosting of the built front end              */
/* ------------------------------------------------------------------ */

if (process.env.SERVE_FRONTEND === 'true') {
  const distDir = path.resolve(here, '..', '..', 'frontend', 'dist');
  app.use(express.static(distDir, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distDir, 'index.html'));
  });
  console.log(`[server] serving front end from ${distDir}`);
}

app.use(notFoundHandler);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/*  Lifecycle                                                          */
/* ------------------------------------------------------------------ */

const server = app.listen(env.port, () => {
  console.log(`\n  Lupus AI Labs API listening on http://localhost:${env.port}`);
  console.log(`  Environment : ${env.NODE_ENV}`);
  console.log(`  Allowed CORS: ${env.allowedOrigins.join(', ') || '(none)'}`);
  console.log(`  Admin portal: ${env.frontendUrl}${env.adminBasePath}\n`);
});

/** Expires stale session rows so the table cannot grow without bound. */
const cleanupTimer = setInterval(
  () => {
    prisma.adminSession
      .deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
      .catch(() => {});
  },
  60 * 60 * 1000
);
cleanupTimer.unref();

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[server] ${signal} received, shutting down.`);
  clearInterval(cleanupTimer);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

export default app;
