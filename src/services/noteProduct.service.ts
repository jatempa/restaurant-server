import { prisma } from '../lib/db.js';

export interface CreateNoteProductData {
  noteId: number;
  productId: number;
  amount: number;
  total?: number;
}

export class InsufficientStockError extends Error {
  constructor() {
    super('Insufficient stock');
    this.name = 'InsufficientStockError';
  }
}

export async function create(data: CreateNoteProductData) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.updateMany({
      where: { id: data.productId, stock: { gte: data.amount } },
      data: { stock: { decrement: data.amount } },
    });
    if (updated.count === 0) {
      throw new InsufficientStockError();
    }
    return tx.noteProduct.create({
      data: {
        noteId: data.noteId,
        productId: data.productId,
        amount: data.amount,
        total: data.total ?? 0,
      },
      include: {
        note: true,
        product: true,
      },
    });
  });
}

export async function deleteByNoteAndProduct(noteId: number, productId: number) {
  await prisma.$transaction(async (tx) => {
    const noteProducts = await tx.noteProduct.findMany({
      where: { noteId, productId },
      select: { amount: true },
    });
    if (noteProducts.length === 0) {
      return;
    }
    const amountToRestore = noteProducts.reduce((sum, item) => sum + item.amount, 0);
    await tx.noteProduct.deleteMany({
      where: { noteId, productId },
    });
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: amountToRestore } },
    });
  });
}

export async function deleteByNoteId(noteId: number) {
  await prisma.noteProduct.deleteMany({
    where: { noteId },
  });
}

export async function updateByNoteAndProduct(
  noteId: number,
  productId: number,
  amount: number
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.noteProduct.findMany({
      where: { noteId, productId },
      select: { amount: true },
    });
    const existingAmount = existing.reduce((sum, item) => sum + item.amount, 0);
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { price: true },
    });
    if (!product) return null;
    const difference = amount - existingAmount;
    if (difference > 0) {
      const updated = await tx.product.updateMany({
        where: { id: productId, stock: { gte: difference } },
        data: { stock: { decrement: difference } },
      });
      if (updated.count === 0) {
        throw new InsufficientStockError();
      }
    } else if (difference < 0) {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: Math.abs(difference) } },
      });
    }
    await tx.noteProduct.deleteMany({
      where: { noteId, productId },
    });
    return tx.noteProduct.create({
      data: { noteId, productId, amount, total: product.price * amount },
      include: {
        note: true,
        product: true,
      },
    });
  });
}
