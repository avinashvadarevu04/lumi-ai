import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Single Prisma client for the process. `globalThis` caching keeps `node --watch`
 * from opening a new connection pool on every reload.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__lupusPrisma ??
  new PrismaClient({
    log: env.isProduction ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!env.isProduction) globalForPrisma.__lupusPrisma = prisma;

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export default prisma;
