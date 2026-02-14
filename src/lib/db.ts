import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

// User fields exposed in API (excludes password, username, etc.)
export const userSelect = {
  id: true,
  email: true,
  name: true,
  firstLastName: true,
} as const;

export function parseId(idParam: string | string[] | undefined): number | null {
  const str = typeof idParam === 'string' ? idParam : undefined;
  if (!str) return null;
  const id = parseInt(str, 10);
  return Number.isNaN(id) ? null : id;
}
