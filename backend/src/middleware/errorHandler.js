import { env } from '../config/env.js';
import { ApiError } from '../lib/http.js';

/** Terminal 404 for unmatched API paths. */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found.', path: req.originalUrl });
}

function translatePrismaError(err) {
  switch (err.code) {
    case 'P2002':
      return ApiError.conflict('A record with that unique value already exists.');
    case 'P2025':
      return ApiError.notFound();
    case 'P2003':
      return ApiError.badRequest('Related record does not exist.');
    default:
      return null;
  }
}

/**
 * Single exit point for errors. Client-safe messages are returned verbatim;
 * anything else is logged server-side and replaced with a generic message so
 * stack traces and driver internals never reach the client.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let error = err;

  if (error?.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    error = translatePrismaError(err) ?? err;
  }

  if (error?.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Request body must be valid JSON.');
  }
  if (error?.type === 'entity.too.large') {
    error = ApiError.badRequest('Request body is too large.');
  }

  if (error instanceof ApiError) {
    const body = { error: error.message };
    if (error.details) body.details = error.details;
    return res.status(error.status).json(body);
  }

  console.error('[error]', req.method, req.originalUrl, err);
  return res.status(500).json({
    error: 'An unexpected error occurred.',
    ...(env.isProduction ? {} : { debug: String(err?.message || err) }),
  });
}
