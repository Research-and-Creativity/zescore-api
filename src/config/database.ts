// src/config/database.ts
import { PrismaClient } from '../generated/prisma/client';

/**
 * Global Prisma Client instance.
 * Synced perfectly with team custom output directory and Edge options.
 */
export const prisma = new PrismaClient({} as any);