import { env } from '../config/env.js';
import { ApiError } from '../lib/http.js';
import { resolveSession, touchSession } from '../lib/auth.js';

/**
 * Attaches `req.auth` when a valid, unrevoked session cookie is present.
 * Never throws, so public routes can vary their behaviour for signed-in staff.
 */
export async function attachAuth(req, _res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    const resolved = await resolveSession(token);
    if (resolved) {
      req.auth = resolved;
      touchSession(resolved.session);
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Blocks the request unless a valid session is attached. Responds with a bare
 * 401 carrying no information about the resource being protected.
 */
export function requireAuth(req, _res, next) {
  if (!req.auth?.user) return next(ApiError.unauthorized('Sign in to continue.'));
  return next();
}

/** Restricts a route to the listed roles. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth?.user) return next(ApiError.unauthorized('Sign in to continue.'));
    if (!roles.includes(req.auth.user.role)) return next(ApiError.forbidden());
    return next();
  };
}
