import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..', '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

/** Fail fast in production; fall back to an ephemeral value in development. */
function requiredSecret(name, minLength = 32) {
  const value = process.env[name];
  if (value && value.length >= minLength) return value;

  if (isProduction) {
    throw new Error(
      `[config] ${name} must be set to a random string of at least ${minLength} characters in production. ` +
        'Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
    );
  }

  const generated = crypto.randomBytes(48).toString('base64url');
  console.warn(
    `[config] ${name} is not set — generated a temporary development value. ` +
      'Sessions will be invalidated on every restart. Set it in backend/.env to persist logins.'
  );
  return generated;
}

function parseOrigins(raw) {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const env = {
  NODE_ENV,
  isProduction,
  isTest: NODE_ENV === 'test',
  port: Number(process.env.PORT) || 5001,

  databaseUrl: process.env.DATABASE_URL || `file:${path.join(backendRoot, 'prisma', 'dev.db')}`,

  jwtSecret: requiredSecret('JWT_SECRET'),
  ipHashSalt: requiredSecret('IP_HASH_SALT', 16),

  /** Session lifetime in hours. */
  sessionTtlHours: Number(process.env.SESSION_TTL_HOURS) || 12,
  cookieName: process.env.SESSION_COOKIE_NAME || 'lupus_ops_session',

  /** Obscure, unlinked base path for the operations gateway. */
  adminBasePath: process.env.ADMIN_BASE_PATH || '/ops-gateway',

  /** Origins permitted to call the API with credentials. */
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS || frontendUrl),
  frontendUrl,

  /** Express `trust proxy` setting — must reflect your real deployment topology. */
  trustProxy: process.env.TRUST_PROXY || 'loopback',

  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@lupusailabs.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
};

// Prisma reads the connection string from the environment.
process.env.DATABASE_URL = env.databaseUrl;

export default env;
