import { Router } from 'express';
import { createLeadHandler } from './leads.js';
import { leadLimiter } from '../middleware/rateLimiters.js';

/**
 * Backwards-compatible alias for the original prototype endpoint.
 * `POST /api/contact` runs the same hardened pipeline as `POST /api/leads`.
 *
 * The old unauthenticated `GET /api/contact` listing has been removed: it
 * returned every submitted lead to anyone who asked.
 */
const router = Router();

router.post('/', leadLimiter, createLeadHandler);

router.get('/', (_req, res) => {
  res.status(410).json({
    error:
      'This endpoint has been retired. Lead data is available from /api/leads to authenticated staff only.',
  });
});

export default router;
