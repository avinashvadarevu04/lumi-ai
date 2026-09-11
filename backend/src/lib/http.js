/** Error carrying an HTTP status code and a safe, client-facing message. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Invalid request.', details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'You do not have access to this resource.') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }
  static conflict(message = 'That record already exists.') {
    return new ApiError(409, message);
  }
  static tooMany(message = 'Too many requests. Please slow down.') {
    return new ApiError(429, message);
  }
}

/** Wraps an async route handler so rejected promises reach the error middleware. */
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/** Parses `?page=&pageSize=` into safe integers. */
export function parsePagination(query, { defaultSize = 25, maxSize = 200 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requested = Number.parseInt(query.pageSize, 10) || defaultSize;
  const pageSize = Math.min(Math.max(1, requested), maxSize);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
