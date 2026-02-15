import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as accountService from './account.service.js';
import * as noteProductService from './noteProduct.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    account: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    note: {
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
  userSelect: { id: true, email: true, name: true, firstLastName: true },
}));
vi.mock('./noteProduct.service.js', () => ({
  deleteByNoteId: vi.fn(),
}));

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all accounts with user', async () => {
      const mockAccounts = [{ id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null, user: { id: 1, name: 'Test' } }];
      vi.mocked(prisma.account.findMany).mockResolvedValue(mockAccounts);

      const result = await accountService.findAll();

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        include: { user: { select: expect.any(Object) } },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('findByUserId', () => {
    it('returns accounts for user', async () => {
      const mockAccounts = [{ id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null, user: { id: 1 } }];
      vi.mocked(prisma.account.findMany).mockResolvedValue(mockAccounts);

      const result = await accountService.findByUserId(1);

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: { select: expect.any(Object) } },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('findById', () => {
    it('returns account when found', async () => {
      const mockAccount = { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null, user: { id: 1 }, notes: [] };
      vi.mocked(prisma.account.findUnique).mockResolvedValue(mockAccount);

      const result = await accountService.findById(1);

      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: { select: expect.any(Object) }, notes: true },
      });
      expect(result).toEqual(mockAccount);
    });

    it('returns null when not found', async () => {
      vi.mocked(prisma.account.findUnique).mockResolvedValue(null);

      const result = await accountService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates account with required and optional fields', async () => {
      const mockCreated = { id: 1, userId: 1, name: 'Mesa 1', checkin: new Date('2026-02-14T12:00:00'), checkout: null, user: { id: 1 } };
      vi.mocked(prisma.account.create).mockResolvedValue(mockCreated);

      const result = await accountService.create({
        userId: 1,
        name: 'Mesa 1',
        checkin: new Date('2026-02-14T12:00:00'),
      });

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          name: 'Mesa 1',
          checkin: new Date('2026-02-14T12:00:00'),
          checkout: null,
        },
        include: { user: { select: expect.any(Object) } },
      });
      expect(result).toEqual(mockCreated);
    });

    it('creates account with only required userId', async () => {
      vi.mocked(prisma.account.create).mockResolvedValue({ id: 1, userId: 1, name: null, checkin: null, checkout: null });

      await accountService.create({ userId: 1 });

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: { userId: 1, name: null, checkin: null, checkout: null },
        include: { user: { select: expect.any(Object) } },
      });
    });
  });

  describe('update', () => {
    it('updates account with provided fields', async () => {
      const mockUpdated = { id: 1, userId: 1, name: 'Mesa 2', checkin: null, checkout: null, user: { id: 1 }, notes: [] };
      vi.mocked(prisma.account.update).mockResolvedValue(mockUpdated);

      const result = await accountService.update(1, { name: 'Mesa 2' });

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Mesa 2' },
        include: { user: { select: expect.any(Object) }, notes: true },
      });
      expect(result).toEqual(mockUpdated);
    });

    it('clears optional fields when passed null', async () => {
      vi.mocked(prisma.account.update).mockResolvedValue({ id: 1, userId: 1, name: null, checkin: null, checkout: null });

      await accountService.update(1, { checkout: null });

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { checkout: null },
        include: { user: { select: expect.any(Object) }, notes: true },
      });
    });
  });

  describe('remove', () => {
    it('deletes notes and note products first then account', async () => {
      vi.mocked(prisma.note.findMany).mockResolvedValue([{ id: 10 }, { id: 11 }] as never);
      vi.mocked(prisma.note.delete).mockResolvedValue({} as never);
      vi.mocked(prisma.account.delete).mockResolvedValue({ id: 1, userId: 1, name: null, checkin: null, checkout: null });

      vi.mocked(noteProductService.deleteByNoteId).mockResolvedValue(undefined);

      await accountService.remove(1);

      expect(prisma.note.findMany).toHaveBeenCalledWith({
        where: { accountId: 1 },
        select: { id: true },
      });
      expect(noteProductService.deleteByNoteId).toHaveBeenCalledWith(10);
      expect(noteProductService.deleteByNoteId).toHaveBeenCalledWith(11);
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 11 } });
      expect(prisma.account.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('deletes account with no notes', async () => {
      vi.mocked(prisma.note.findMany).mockResolvedValue([]);
      vi.mocked(prisma.account.delete).mockResolvedValue({ id: 1, userId: 1, name: null, checkin: null, checkout: null });

      await accountService.remove(1);

      expect(prisma.account.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
