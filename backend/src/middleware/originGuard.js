import { env } from '../config/env.js';
import { ApiError } from '../lib/http.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isAllowed(origin) {
  if (!origin) return false;
  const normalised = origin.replace(/\/$/, '');
  if (env.allowedOrigins.includes(normalised)) return true;
  // Vite picks a new port when 5173 is busy, so accept any local port in dev.
  if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalised)) return true;
  return false;
}

/**
 * Second line of CSRF defence behind the SameSite=strict session cookie:
 * every state-changing request must carry an Origin (or Referer) belonging to
 * a known front end. Same-origin browser requests always send one; a
 * cross-site form post cannot forge it.
 *
 * Requests with no Origin at all (curl, server-to-server) are allowed only
 * outside production, where they are needed for local testing.
 */
export function originGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin) {
    return isAllowed(origin) ? next() : next(ApiError.forbidden('Request origin is not allowed.'));
  }

  const referer = req.get('referer');
  if (referer) {
    try {
      return isAllowed(new URL(referer).origin)
        ? next()
        : next(ApiError.forbidden('Request origin is not allowed.'));
    } catch {
      return next(ApiError.forbidden('Request origin is not allowed.'));
    }
  }

  if (env.isProduction) return next(ApiError.forbidden('Request origin is required.'));
  return next();
}
