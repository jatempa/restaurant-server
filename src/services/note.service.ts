import { prisma, userSelect } from '../lib/db.js';

export async function findAll() {
  return prisma.note.findMany({
    include: {
      user: { select: userSelect },
      account: true,
      noteProducts: { include: { product: true } },
    },
    orderBy: { id: 'asc' },
  });
}

export async function findById(id: number) {
  return prisma.note.findUnique({
    where: { id },
    include: {
      user: { select: userSelect },
      account: true,
      noteProducts: { include: { product: true } },
    },
  });
}
