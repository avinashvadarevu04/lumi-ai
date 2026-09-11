/** Lead workflow states, in pipeline order. */
export const LEAD_STATUSES = ['NEW', 'IN_REVIEW', 'CONTACTED', 'ARCHIVED'];

/** Systems a prospect can express interest in. */
export const LEAD_SYSTEMS = ['CUSTOMER_INTERACTION', 'OPERATIONS', 'PRODUCTS', 'GENERAL'];

/** Telemetry event kinds accepted from the public site. */
export const TELEMETRY_TYPES = ['PAGE_VIEW', 'SECTION_VIEW', 'CTA_CLICK', 'LEAD_SUBMIT', 'SYSTEM'];

/** Admin roles. */
export const ADMIN_ROLES = ['SUPER_ADMIN', 'EDITOR'];

/** Audit log action names. */
export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_LOCKED: 'LOGIN_LOCKED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  LEAD_DELETED: 'LEAD_DELETED',
  LEAD_EXPORTED: 'LEAD_EXPORTED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_DELETED: 'PROJECT_DELETED',
  PROJECT_REORDERED: 'PROJECT_REORDERED',
};

/** Brute-force policy for the login endpoint. */
export const LOGIN_POLICY = {
  maxFailedAttempts: 5,
  lockoutMinutes: 15,
};
