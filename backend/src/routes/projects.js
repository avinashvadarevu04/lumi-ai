import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../lib/http.js';
import { AUDIT_ACTIONS } from '../lib/constants.js';
import { recordAudit } from '../lib/audit.js';
import {
  projectCreateSchema,
  projectReorderSchema,
  projectUpdateSchema,
  validate,
} from '../lib/validation.js';
import { requireAuth } from '../middleware/authGuard.js';

const router = Router();

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Ensures slug uniqueness by appending -2, -3, ... when needed. */
async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || 'project';
  let candidate = root;
  for (let n = 2; n < 100; n += 1) {
    const clash = await prisma.project.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

const parseList = (raw) => {
  try {
    const parsed = JSON.parse(raw ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Converts a database row into the JSON shape the clients consume. */
function serialise(project) {
  return {
    ...project,
    technologies: parseList(project.technologies),
    highlights: parseList(project.highlights),
  };
}

/**
 * GET /api/projects
 * Public callers receive published case studies only. An authenticated admin
 * receives drafts as well, so the dashboard can manage unpublished work.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const isAdmin = Boolean(req.auth?.user);
    const projects = await prisma.project.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ projects: projects.map(serialise) });
  })
);

/** GET /api/projects/:idOrSlug */
router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(req.auth?.user ? {} : { isPublished: true }),
      },
    });
    if (!project) throw ApiError.notFound('Case study not found.');
    res.json({ project: serialise(project) });
  })
);

/** POST /api/projects */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = validate(projectCreateSchema, req.body);
    const slug = await uniqueSlug(data.slug || data.title);

    const last = await prisma.project.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        category: data.category,
        headline: data.headline ?? null,
        description: data.description,
        solution: data.solution ?? null,
        workflowSummary: data.workflowSummary ?? null,
        metrics: data.metrics ?? null,
        technologies: JSON.stringify(data.technologies ?? []),
        highlights: JSON.stringify(data.highlights ?? []),
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? true,
        order: data.order || (last ? last.order + 1 : 0),
      },
    });

    await recordAudit(req, {
      action: AUDIT_ACTIONS.PROJECT_CREATED,
      entity: 'Project',
      entityId: project.id,
      detail: project.title,
    });

    res.status(201).json({ project: serialise(project) });
  })
);

/** POST /api/projects/reorder — accepts an array of ids in display order. */
router.post(
  '/reorder',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { order } = validate(projectReorderSchema, req.body);

    await prisma.$transaction(
      order.map((id, index) => prisma.project.update({ where: { id }, data: { order: index } }))
    );

    await recordAudit(req, {
      action: AUDIT_ACTIONS.PROJECT_REORDERED,
      detail: `${order.length} case studies`,
    });

    const projects = await prisma.project.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    res.json({ projects: projects.map(serialise) });
  })
);

/** PATCH /api/projects/:id */
router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = validate(projectUpdateSchema, req.body);

    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Case study not found.');

    const patch = {};
    for (const key of [
      'title',
      'category',
      'headline',
      'description',
      'solution',
      'workflowSummary',
      'metrics',
      'isFeatured',
      'isPublished',
      'order',
    ]) {
      if (data[key] !== undefined) patch[key] = data[key];
    }
    if (data.technologies !== undefined) patch.technologies = JSON.stringify(data.technologies);
    if (data.highlights !== undefined) patch.highlights = JSON.stringify(data.highlights);
    if (data.slug !== undefined && data.slug !== existing.slug) {
      patch.slug = await uniqueSlug(data.slug, existing.id);
    }

    const project = await prisma.project.update({ where: { id: existing.id }, data: patch });

    await recordAudit(req, {
      action: AUDIT_ACTIONS.PROJECT_UPDATED,
      entity: 'Project',
      entityId: project.id,
      detail: Object.keys(patch).join(', ') || 'no-op',
    });

    res.json({ project: serialise(project) });
  })
);

/** DELETE /api/projects/:id */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Case study not found.');

    await prisma.project.delete({ where: { id: existing.id } });
    await recordAudit(req, {
      action: AUDIT_ACTIONS.PROJECT_DELETED,
      entity: 'Project',
      entityId: existing.id,
      detail: existing.title,
    });

    res.json({ ok: true });
  })
);

export default router;
