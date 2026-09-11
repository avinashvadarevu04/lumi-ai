/**
 * Base path for the hidden operations gateway.
 * Override at build time with VITE_ADMIN_BASE_PATH and keep it out of every
 * public link, sitemap and navigation surface.
 */
export const ADMIN_BASE_PATH = (import.meta.env.VITE_ADMIN_BASE_PATH || '/ops-gateway').replace(/\/$/, '');

export function isAdminPath(pathname) {
  return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`);
}

/** Builds an absolute in-app URL for a dashboard view. */
export function adminUrl(view = '') {
  const clean = String(view).replace(/^\//, '');
  return clean ? `${ADMIN_BASE_PATH}/${clean}` : ADMIN_BASE_PATH;
}

/** Reads the active view out of the current pathname. */
export function viewFromPath(pathname = window.location.pathname) {
  if (!isAdminPath(pathname)) return 'overview';
  const rest = pathname.slice(ADMIN_BASE_PATH.length).replace(/^\//, '').replace(/\/$/, '');
  return rest || 'overview';
}
