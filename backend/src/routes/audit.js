import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler, parsePagination } from '../lib/http.js';
import { requireAuth } from '../middleware/authGuard.js';

const router = Router();

/** GET /api/audit — access and change history for the settings screen. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip, take } = parsePagination(req.query, { defaultSize: 50 });
    const where = req.query.action ? { action: String(req.query.action) } : {};

    const [total, entries] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          detail: true,
          userAgent: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
    ]);

    res.json({
      entries: entries.map((e) => ({ ...e, actor: e.user?.email ?? null, user: undefined })),
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  })
);

export default router;
