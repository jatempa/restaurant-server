import { prisma, userSelect } from '../lib/db.js';

export interface CreateAccountData {
  userId: number;
  name?: string;
  checkin?: Date;
  checkout?: Date;
}

export interface UpdateAccountData {
  name?: string;
  checkin?: Date | null;
  checkout?: Date | null;
}

export async function findAll() {
  return prisma.account.findMany({
    include: { user: { select: userSelect } },
    orderBy: { id: 'asc' },
  });
}

export async function findByUserId(userId: number) {
  return prisma.account.findMany({
    where: { userId },
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

export async function create(data: CreateAccountData) {
  return prisma.account.create({
    data: {
      userId: data.userId,
      name: data.name ?? null,
      checkin: data.checkin ?? null,
      checkout: data.checkout ?? null,
    },
    include: { user: { select: userSelect } },
  });
}

export async function update(id: number, data: UpdateAccountData) {
  return prisma.account.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.checkin !== undefined && { checkin: data.checkin ?? null }),
      ...(data.checkout !== undefined && { checkout: data.checkout ?? null }),
    },
    include: { user: { select: userSelect }, notes: true },
  });
}

export async function remove(id: number) {
  return prisma.account.delete({
    where: { id },
  });
}
