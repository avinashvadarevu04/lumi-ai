import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Salted, one-way hash of a client IP. Storing this instead of the raw address
 * keeps abuse investigation and rate-limit forensics possible without
 * retaining directly identifying data.
 */
export function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(`${env.ipHashSalt}:${ip}`).digest('hex').slice(0, 32);
}

/** Best-effort client IP, honouring Express's trust-proxy resolution. */
export function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || null;
}

/** Truncated User-Agent, capped so a hostile client cannot bloat the database. */
export function shortUserAgent(req) {
  const ua = req.get('user-agent');
  return ua ? ua.slice(0, 255) : null;
}

/** Constant-time string comparison. */
export function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}
