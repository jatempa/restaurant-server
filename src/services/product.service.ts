import { prisma } from '../lib/db.js';

export async function findAll() {
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { id: 'asc' },
  });
}

export async function findById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}
