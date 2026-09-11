import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from './prisma.js';
import { hashIp, clientIp, shortUserAgent } from './crypto.js';

const BCRYPT_ROUNDS = 12;
const JWT_ALGORITHM = 'HS256';

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Bcrypt comparison against a throwaway hash. Called when an account does not
 * exist so the response time for a bad email matches that of a bad password,
 * closing the user-enumeration side channel.
 */
const DUMMY_HASH = bcrypt.hashSync('lupus-invalid-password-placeholder', BCRYPT_ROUNDS);
export function burnPasswordCycle() {
  return bcrypt.compare('lupus-invalid-password-placeholder', DUMMY_HASH);
}

function sessionExpiry() {
  return new Date(Date.now() + env.sessionTtlHours * 60 * 60 * 1000);
}

/** Creates a server-side session row and returns the signed JWT bound to it. */
export async function issueSession(user, req) {
  const tokenId = crypto.randomUUID();
  const expiresAt = sessionExpiry();

  await prisma.adminSession.create({
    data: {
      tokenId,
      userId: user.id,
      expiresAt,
      userAgent: shortUserAgent(req),
      ipHash: hashIp(clientIp(req)),
    },
  });

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    jwtid: tokenId,
    expiresIn: Math.floor(env.sessionTtlHours * 60 * 60),
    issuer: 'lupus-ops',
    audience: 'lupus-admin',
  });

  return { token, tokenId, expiresAt };
}

/**
 * Validates a JWT *and* its backing session row. A revoked or expired session
 * fails even while the JWT signature is still cryptographically valid, which is
 * what makes "revoke session" meaningful.
 */
export async function resolveSession(token) {
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      algorithms: [JWT_ALGORITHM],
      issuer: 'lupus-ops',
      audience: 'lupus-admin',
    });
  } catch {
    return null;
  }

  if (!payload?.jti || !payload?.sub) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenId: payload.jti },
    include: { user: true },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (session.userId !== payload.sub) return null;
  if (!session.user?.isActive) return null;

  // A password change invalidates every session opened before it.
  if (session.user.passwordChangedAt.getTime() > session.createdAt.getTime()) return null;

  return { session, user: session.user };
}

/** Refreshes lastSeenAt, throttled to at most once a minute per session. */
export async function touchSession(session) {
  if (Date.now() - session.lastSeenAt.getTime() < 60000) return;
  await prisma.adminSession
    .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});
}

export async function revokeSession(tokenId) {
  await prisma.adminSession
    .updateMany({ where: { tokenId, revokedAt: null }, data: { revokedAt: new Date() } })
    .catch(() => {});
}

export async function revokeAllSessionsForUser(userId, { exceptTokenId } = {}) {
  const where = { userId, revokedAt: null };
  if (exceptTokenId) where.tokenId = { not: exceptTokenId };
  const result = await prisma.adminSession.updateMany({ where, data: { revokedAt: new Date() } });
  return result.count;
}

export function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.isProduction,
    path: '/',
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

export function setSessionCookie(res, token) {
  res.cookie(env.cookieName, token, cookieOptions(env.sessionTtlHours * 60 * 60 * 1000));
}

export function clearSessionCookie(res) {
  res.clearCookie(env.cookieName, cookieOptions());
}

/** Strips secrets before an admin record crosses the wire. */
export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}
