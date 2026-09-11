import { prisma } from './prisma.js';
import { hashIp, clientIp, shortUserAgent } from './crypto.js';

/**
 * Appends an audit entry. Deliberately never throws: a logging failure must not
 * break the request it is recording.
 */
export async function recordAudit(req, { action, userId = null, entity = null, entityId = null, detail = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? req?.auth?.user?.id ?? null,
        entity,
        entityId,
        detail: detail ? String(detail).slice(0, 500) : null,
        ipHash: hashIp(clientIp(req)),
        userAgent: shortUserAgent(req),
      },
    });
  } catch (error) {
    console.error('[audit] failed to write entry', action, error?.message);
  }
}
