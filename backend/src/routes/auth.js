import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError, asyncHandler } from '../lib/http.js';
import { AUDIT_ACTIONS, LOGIN_POLICY } from '../lib/constants.js';
import { recordAudit } from '../lib/audit.js';
import {
  loginSchema,
  changePasswordSchema,
  changeEmailSchema,
  validate,
} from '../lib/validation.js';
import {
  burnPasswordCycle,
  clearSessionCookie,
  hashPassword,
  issueSession,
  publicUser,
  revokeAllSessionsForUser,
  revokeSession,
  setSessionCookie,
  verifyPassword,
} from '../lib/auth.js';
import { requireAuth } from '../middleware/authGuard.js';
import { loginLimiter, sensitiveLimiter } from '../middleware/rateLimiters.js';

const router = Router();

/** Identical response for every failure mode, so nothing can be enumerated. */
const INVALID_CREDENTIALS = 'Invalid email or password.';

/**
 * POST /api/auth/login
 * Rate limited per IP and locked per account after repeated failures.
 */
router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = validate(loginSchema, req.body);

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      await burnPasswordCycle(); // equalise timing against the unknown-account path
      await recordAudit(req, { action: AUDIT_ACTIONS.LOGIN_FAILED, detail: `unknown or inactive: ${email}` });
      throw ApiError.unauthorized(INVALID_CREDENTIALS);
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      await recordAudit(req, { action: AUDIT_ACTIONS.LOGIN_LOCKED, userId: user.id });
      throw new ApiError(423, `Account temporarily locked. Try again in ${minutes} minute(s).`);
    }

    const ok = await verifyPassword(password, user.passwordHash);

    if (!ok) {
      const failedLoginCount = user.failedLoginCount + 1;
      const shouldLock = failedLoginCount >= LOGIN_POLICY.maxFailedAttempts;
      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          failedLoginCount,
          lockedUntil: shouldLock ? new Date(Date.now() + LOGIN_POLICY.lockoutMinutes * 60000) : null,
        },
      });
      await recordAudit(req, {
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        userId: user.id,
        detail: `attempt ${failedLoginCount}/${LOGIN_POLICY.maxFailedAttempts}`,
      });
      throw ApiError.unauthorized(INVALID_CREDENTIALS);
    }

    const [, { token }] = await Promise.all([
      prisma.adminUser.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
      }),
      issueSession(user, req),
    ]);

    setSessionCookie(res, token);
    await recordAudit(req, { action: AUDIT_ACTIONS.LOGIN_SUCCESS, userId: user.id });

    const fresh = await prisma.adminUser.findUnique({ where: { id: user.id } });
    res.json({ user: publicUser(fresh) });
  })
);

/** POST /api/auth/logout — revokes the current session server-side. */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    if (req.auth?.session) {
      await revokeSession(req.auth.session.tokenId);
      await recordAudit(req, { action: AUDIT_ACTIONS.LOGOUT, userId: req.auth.user.id });
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  })
);

/** GET /api/auth/me — identity probe used by the dashboard on boot. */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({
      user: publicUser(req.auth.user),
      session: {
        id: req.auth.session.id,
        createdAt: req.auth.session.createdAt,
        expiresAt: req.auth.session.expiresAt,
      },
    });
  })
);

/** GET /api/auth/sessions — every live session for the signed-in admin. */
router.get(
  '/sessions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await prisma.adminSession.findMany({
      where: { userId: req.auth.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        tokenId: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
      },
    });

    res.json({
      sessions: sessions.map(({ tokenId, ...rest }) => ({
        ...rest,
        isCurrent: tokenId === req.auth.session.tokenId,
      })),
    });
  })
);

/** DELETE /api/auth/sessions/:id — revoke one device. */
router.delete(
  '/sessions/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const session = await prisma.adminSession.findFirst({
      where: { id: req.params.id, userId: req.auth.user.id },
    });
    if (!session) throw ApiError.notFound('Session not found.');

    await revokeSession(session.tokenId);
    await recordAudit(req, {
      action: AUDIT_ACTIONS.SESSION_REVOKED,
      entity: 'AdminSession',
      entityId: session.id,
    });

    if (session.tokenId === req.auth.session.tokenId) clearSessionCookie(res);
    res.json({ ok: true, revokedSelf: session.tokenId === req.auth.session.tokenId });
  })
);

/** POST /api/auth/sessions/revoke-others — sign out every other device. */
router.post(
  '/sessions/revoke-others',
  requireAuth,
  asyncHandler(async (req, res) => {
    const count = await revokeAllSessionsForUser(req.auth.user.id, {
      exceptTokenId: req.auth.session.tokenId,
    });
    await recordAudit(req, {
      action: AUDIT_ACTIONS.SESSION_REVOKED,
      detail: `revoked ${count} other session(s)`,
    });
    res.json({ ok: true, revoked: count });
  })
);

/** POST /api/auth/change-password — re-authenticates, then invalidates all sessions. */
router.post(
  '/change-password',
  requireAuth,
  sensitiveLimiter,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = validate(changePasswordSchema, req.body);

    const ok = await verifyPassword(currentPassword, req.auth.user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Your current password is incorrect.');

    await prisma.adminUser.update({
      where: { id: req.auth.user.id },
      data: {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });

    // Every existing session predates the change and is now invalid.
    await revokeAllSessionsForUser(req.auth.user.id);
    await recordAudit(req, { action: AUDIT_ACTIONS.PASSWORD_CHANGED, userId: req.auth.user.id });

    clearSessionCookie(res);
    res.json({ ok: true, message: 'Password updated. Please sign in again.' });
  })
);

/** POST /api/auth/change-email — re-authenticates before moving the login identity. */
router.post(
  '/change-email',
  requireAuth,
  sensitiveLimiter,
  asyncHandler(async (req, res) => {
    const { currentPassword, email } = validate(changeEmailSchema, req.body);

    const ok = await verifyPassword(currentPassword, req.auth.user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Your current password is incorrect.');

    if (email === req.auth.user.email) throw ApiError.badRequest('That is already your email address.');

    const taken = await prisma.adminUser.findUnique({ where: { email } });
    if (taken) throw ApiError.conflict('That email address is already in use.');

    const updated = await prisma.adminUser.update({
      where: { id: req.auth.user.id },
      data: { email },
    });
    await recordAudit(req, { action: 'EMAIL_CHANGED', userId: req.auth.user.id, detail: email });

    res.json({ ok: true, user: publicUser(updated) });
  })
);

export default router;
