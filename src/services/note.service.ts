import { prisma, userSelect } from '../lib/db.js';

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
  return prisma.note.delete({
    where: { id },
  });
}
