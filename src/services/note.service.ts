import { prisma, userSelect } from '../lib/db.js';
import * as noteProductService from './noteProduct.service.js';
import * as productService from './product.service.js';

export interface CreateNoteData {
  userId: number;
  accountId: number;
  numberNote: number;
  status: string;
  checkin?: Date;
  checkout?: Date;
}

export interface UpdateNoteData {
  userId?: number;
  accountId?: number;
  numberNote?: number;
  status?: string;
  checkin?: Date | null;
  checkout?: Date | null;
}

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

export async function findByAccountId(accountId: number) {
  return prisma.note.findMany({
    where: { accountId },
    include: {
      user: { select: userSelect },
      account: true,
      noteProducts: { include: { product: true } },
    },
    orderBy: { id: 'asc' },
  });
}

export async function getNextNumberForAccount(accountId: number): Promise<number> {
  const count = await prisma.note.count({ where: { accountId } });
  return count + 1;
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

export async function create(data: CreateNoteData) {
  return prisma.note.create({
    data: {
      userId: data.userId,
      accountId: data.accountId,
      numberNote: data.numberNote,
      status: data.status,
      checkin: data.checkin ?? null,
      checkout: data.checkout ?? null,
    },
    include: {
      user: { select: userSelect },
      account: true,
      noteProducts: { include: { product: true } },
    },
  });
}

export async function update(id: number, data: UpdateNoteData) {
  return prisma.note.update({
    where: { id },
    data: {
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.accountId !== undefined && { accountId: data.accountId }),
      ...(data.numberNote !== undefined && { numberNote: data.numberNote }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.checkin !== undefined && { checkin: data.checkin ?? null }),
      ...(data.checkout !== undefined && { checkout: data.checkout ?? null }),
    },
    include: {
      user: { select: userSelect },
      account: true,
      noteProducts: { include: { product: true } },
    },
  });
}

export async function remove(id: number) {
  await noteProductService.deleteByNoteId(id);
  return prisma.note.delete({
    where: { id },
  });
}

export async function reduceStockForNote(noteId: number) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { noteProducts: true },
  });
  if (!note) return;
  const byProduct: Record<number, number> = {};
  for (const np of note.noteProducts) {
    byProduct[np.productId] = (byProduct[np.productId] ?? 0) + np.amount;
  }
  for (const [productId, amount] of Object.entries(byProduct)) {
    await productService.reduceStock(Number(productId), amount);
  }
}

export async function closeAllByAccountId(accountId: number, checkoutDate: Date) {
  const notesToClose = await prisma.note.findMany({
    where: { accountId, checkout: null },
    select: { id: true },
  });
  for (const note of notesToClose) {
    await reduceStockForNote(note.id);
  }
  return prisma.note.updateMany({
    where: { accountId, checkout: null },
    data: { checkout: checkoutDate, status: 'closed' },
  });
}
