import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler, parsePagination } from '../lib/http.js';
import { AUDIT_ACTIONS } from '../lib/constants.js';
import { recordAudit } from '../lib/audit.js';
import { hashIp, clientIp, shortUserAgent } from '../lib/crypto.js';
import { toCsv } from '../lib/csv.js';
import { leadCreateSchema, leadQuerySchema, leadUpdateSchema, validate } from '../lib/validation.js';
import { requireAuth } from '../middleware/authGuard.js';
import { leadLimiter } from '../middleware/rateLimiters.js';

const router = Router();

/** Fields returned to an authenticated admin. */
const ADMIN_SELECT = {
  id: true,
  name: true,
  email: true,
  company: true,
  selectedSystem: true,
  message: true,
  status: true,
  source: true,
  notes: true,
  contactedAt: true,
  createdAt: true,
  updatedAt: true,
};

function buildWhere(query) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.system) where.selectedSystem = query.system;
  if (query.search) {
    // SQLite LIKE is case-insensitive for ASCII, so no `mode` flag is needed
    // (and Prisma rejects `mode: 'insensitive'` on this provider).
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { company: { contains: query.search } },
      { message: { contains: query.search } },
    ];
  }
  return where;
}

/**
 * POST /api/leads  (public)
 * Captures a consultation request from the site's contact form.
 */
export const createLeadHandler = asyncHandler(async (req, res) => {
  {
    const data = validate(leadCreateSchema, req.body);

    // Honeypot: respond exactly as for a real submission so the bot learns nothing.
    if (data.website && data.website.trim() !== '') {
      return res.status(201).json({ ok: true, message: 'Thank you. Your enquiry has been received.' });
    }

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company ?? null,
        selectedSystem: data.selectedSystem,
        message: data.message,
        source: data.source ?? 'website',
        ipHash: hashIp(clientIp(req)),
        userAgent: shortUserAgent(req),
      },
    });

    // Conversion signal for the dashboard, best-effort.
    prisma.telemetry
      .create({
        data: {
          type: 'LEAD_SUBMIT',
          label: lead.selectedSystem,
          path: '/',
          ipHash: hashIp(clientIp(req)),
          meta: JSON.stringify({ leadId: lead.id }),
        },
      })
      .catch(() => {});

    return res.status(201).json({
      ok: true,
      id: lead.id,
      message: 'Thank you. Your enquiry has been received and we will respond within 24 hours.',
    });
  }
});

router.post('/', leadLimiter, createLeadHandler);

/** GET /api/leads — filterable, paginated list. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = validate(leadQuerySchema, req.query);
    const { page, pageSize, skip, take } = parsePagination(req.query);
    const where = buildWhere(query);

    const [total, leads, statusCounts] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        select: ADMIN_SELECT,
        orderBy: { createdAt: query.sort === 'oldest' ? 'asc' : 'desc' },
        skip,
        take,
      }),
      prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    res.json({
      leads,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      counts: Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all])),
    });
  })
);

/** GET /api/leads/export.csv — current filter set as a spreadsheet. */
router.get(
  '/export.csv',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = validate(leadQuerySchema, req.query);
    const leads = await prisma.lead.findMany({
      where: buildWhere(query),
      select: ADMIN_SELECT,
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const csv = toCsv(
      [
        { key: 'id', label: 'ID' },
        { key: 'createdAt', label: 'Received', map: (r) => r.createdAt.toISOString() },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'selectedSystem', label: 'System' },
        { key: 'status', label: 'Status' },
        { key: 'message', label: 'Message' },
        { key: 'notes', label: 'Internal notes' },
      ],
      leads
    );

    await recordAudit(req, { action: AUDIT_ACTIONS.LEAD_EXPORTED, detail: `${leads.length} row(s)` });

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lupus-leads-${stamp}.csv"`);
    res.send(csv);
  })
);

/** GET /api/leads/:id */
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id }, select: ADMIN_SELECT });
    if (!lead) throw ApiError.notFound('Lead not found.');
    res.json({ lead });
  })
);

/** PATCH /api/leads/:id — status transitions and internal notes. */
router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = validate(leadUpdateSchema, req.body);

    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Lead not found.');

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(data.status === 'CONTACTED' && !existing.contactedAt ? { contactedAt: new Date() } : {}),
      },
      select: ADMIN_SELECT,
    });

    await recordAudit(req, {
      action: AUDIT_ACTIONS.LEAD_UPDATED,
      entity: 'Lead',
      entityId: lead.id,
      detail: data.status ? `${existing.status} -> ${data.status}` : 'notes updated',
    });

    res.json({ lead });
  })
);

/** DELETE /api/leads/:id */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Lead not found.');

    await prisma.lead.delete({ where: { id: req.params.id } });
    await recordAudit(req, {
      action: AUDIT_ACTIONS.LEAD_DELETED,
      entity: 'Lead',
      entityId: req.params.id,
      detail: existing.email,
    });

    res.json({ ok: true });
  })
);

export default router;
