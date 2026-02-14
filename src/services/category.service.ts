import { prisma } from '../lib/db.js';

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name: string;
}

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

export async function create(data: CreateCategoryData) {
  return prisma.category.create({
    data: { name: data.name },
    include: { products: true },
  });
}

export async function update(id: number, data: UpdateCategoryData) {
  return prisma.category.update({
    where: { id },
    data: { name: data.name },
    include: { products: true },
  });
}

export async function remove(id: number) {
  return prisma.category.delete({
    where: { id },
  });
}
