import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/** GET /api/health — liveness plus a real database round trip. */
router.get('/', async (_req, res) => {
  let database = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'unavailable';
  }

  res.status(database === 'ok' ? 200 : 503).json({
    status: database === 'ok' ? 'ok' : 'degraded',
    service: 'lupus-ai-backend',
    database,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
