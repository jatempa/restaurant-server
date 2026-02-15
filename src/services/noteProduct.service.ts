import { prisma } from '../lib/db.js';

export interface CreateNoteProductData {
  noteId: number;
  productId: number;
  amount: number;
  total?: number;
}

export async function create(data: CreateNoteProductData) {
  return prisma.noteProduct.create({
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
}

export async function deleteByNoteAndProduct(noteId: number, productId: number) {
  await prisma.noteProduct.deleteMany({
    where: { noteId, productId },
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
  await prisma.noteProduct.deleteMany({
    where: { noteId, productId },
  });
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) return null;
  const total = product.price * amount;
  return prisma.noteProduct.create({
    data: { noteId, productId, amount, total },
    include: {
      note: true,
      product: true,
    },
  });
}
