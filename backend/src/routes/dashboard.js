import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/http.js';
import { LEAD_STATUSES } from '../lib/constants.js';
import { requireAuth } from '../middleware/authGuard.js';

const router = Router();

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (date) => date.toISOString().slice(0, 10);

/**
 * GET /api/dashboard/overview
 * Aggregates every figure the Overview screen renders in one round trip.
 */
router.get(
  '/overview',
  requireAuth,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 29 * DAY_MS);
    const previousStart = new Date(now.getTime() - 59 * DAY_MS);

    const [
      totalLeads,
      leadsThisWindow,
      leadsPreviousWindow,
      statusGroups,
      systemGroups,
      publishedProjects,
      totalProjects,
      recentLeads,
      pageViewSessions,
      ctaClicks,
      recentTelemetry,
      leadDates,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: windowStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: previousStart, lt: windowStart } } }),
      prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['selectedSystem'], _count: { _all: true } }),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.project.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          selectedSystem: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.telemetry.findMany({
        where: { type: 'PAGE_VIEW', createdAt: { gte: windowStart } },
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      prisma.telemetry.count({ where: { type: 'CTA_CLICK', createdAt: { gte: windowStart } } }),
      prisma.telemetry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, type: true, label: true, path: true, createdAt: true },
      }),
      prisma.lead.findMany({
        where: { createdAt: { gte: new Date(now.getTime() - 13 * DAY_MS) } },
        select: { createdAt: true },
      }),
    ]);

    const uniqueVisitors = pageViewSessions.filter((row) => row.sessionId).length;
    // Capped at 100: leads can arrive from sessions that were never tracked
    // (ad blockers, direct email), which would otherwise show >100%.
    const conversionRate =
      uniqueVisitors > 0 ? Math.min(100, (leadsThisWindow / uniqueVisitors) * 100) : 0;

    const trendPct =
      leadsPreviousWindow > 0
        ? ((leadsThisWindow - leadsPreviousWindow) / leadsPreviousWindow) * 100
        : leadsThisWindow > 0
          ? 100
          : 0;

    // Dense 14-day series so the sparkline has no gaps.
    const buckets = new Map();
    for (let i = 13; i >= 0; i -= 1) {
      buckets.set(dayKey(new Date(now.getTime() - i * DAY_MS)), 0);
    }
    for (const lead of leadDates) {
      const key = dayKey(lead.createdAt);
      if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
    }

    const statusCounts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
    for (const row of statusGroups) statusCounts[row.status] = row._count._all;

    res.json({
      stats: {
        totalLeads,
        leadsThisWindow,
        newLeads: statusCounts.NEW ?? 0,
        publishedProjects,
        totalProjects,
        uniqueVisitors,
        ctaClicks,
        conversionRate: Number(conversionRate.toFixed(1)),
        trendPct: Number(trendPct.toFixed(1)),
      },
      statusCounts,
      systemCounts: Object.fromEntries(systemGroups.map((row) => [row.selectedSystem, row._count._all])),
      leadSeries: Array.from(buckets, ([date, count]) => ({ date, count })),
      recentLeads,
      recentTelemetry,
      generatedAt: now.toISOString(),
    });
  })
);

export default router;
