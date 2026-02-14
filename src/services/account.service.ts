import { prisma, userSelect } from '../lib/db.js';

export async function findAll() {
  return prisma.account.findMany({
    include: { user: { select: userSelect } },
    orderBy: { id: 'asc' },
  });
}

export async function findById(id: number) {
  return prisma.account.findUnique({
    where: { id },
    include: { user: { select: userSelect }, notes: true },
  });
}
