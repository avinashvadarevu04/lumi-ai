import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, parsePagination } from '../lib/http.js';
import { hashIp, clientIp, shortUserAgent } from '../lib/crypto.js';
import { telemetrySchema, validate } from '../lib/validation.js';
import { requireAuth } from '../middleware/authGuard.js';
import { telemetryLimiter } from '../middleware/rateLimiters.js';

const router = Router();

/**
 * POST /api/telemetry  (public)
 * Fire-and-forget beacon from the marketing site. Always answers 202 so a
 * logging failure can never disturb the visitor's experience.
 */
router.post(
  '/',
  telemetryLimiter,
  asyncHandler(async (req, res) => {
    res.status(202).json({ ok: true });

    try {
      const data = validate(telemetrySchema, req.body);
      await prisma.telemetry.create({
        data: {
          type: data.type,
          label: data.label ?? null,
          path: data.path ?? null,
          referrer: data.referrer ?? null,
          sessionId: data.sessionId ?? null,
          userAgent: shortUserAgent(req),
          ipHash: hashIp(clientIp(req)),
          meta: JSON.stringify(data.meta ?? {}),
        },
      });
    } catch {
      // Swallow: the response has already been sent.
    }
  })
);

/** GET /api/telemetry — recent raw events. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query, { defaultSize: 50 });
    const where = req.query.type ? { type: String(req.query.type) } : {};

    const [total, events] = await Promise.all([
      prisma.telemetry.count({ where }),
      prisma.telemetry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: { id: true, type: true, label: true, path: true, sessionId: true, createdAt: true },
      }),
    ]);

    res.json({
      events,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  })
);

export default router;
