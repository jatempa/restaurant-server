import { prisma } from '../lib/db.js';

export async function findAll() {
  return prisma.category.findMany({
    include: { products: true },
    orderBy: { id: 'asc' },
  });
}

export async function findById(id: number) {
  return prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });
}
