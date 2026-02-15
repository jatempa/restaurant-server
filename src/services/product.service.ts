import { prisma } from '../lib/db.js';

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  categoryId: number;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
}

export async function findAll(categoryId?: number) {
  return prisma.product.findMany({
    ...(categoryId != null && { where: { categoryId } }),
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

export async function create(data: CreateProductData) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
    },
    include: { category: true },
  });
}

export async function update(id: number, data: UpdateProductData) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    },
    include: { category: true },
  });
}

export async function remove(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}

export async function reduceStock(productId: number, amount: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return null;
  const newStock = Math.max(0, product.stock - amount);
  return prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
    include: { category: true },
  });
}
