import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as noteService from './note.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    note: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
  userSelect: { id: true, email: true, name: true, firstLastName: true },
}));
vi.mock('./noteProduct.service.js', () => ({
  deleteByNoteId: vi.fn(),
}));
vi.mock('./product.service.js', () => ({
  reduceStock: vi.fn().mockResolvedValue(undefined),
}));

import * as noteProductService from './noteProduct.service.js';
import * as productService from './product.service.js';

const mockUser = { id: 1, name: 'User', email: 'u@x.com', firstLastName: 'User' };
const mockAccount = { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null };

describe('NoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all notes with user, account and products', async () => {
      const mockNotes = [{ id: 1, userId: 1, accountId: 1, numberNote: 1001, status: 'pending', checkin: null, checkout: null, user: mockUser, account: mockAccount, noteProducts: [] }];
      vi.mocked(prisma.note.findMany).mockResolvedValue(mockNotes);

      const result = await noteService.findAll();

      expect(prisma.note.findMany).toHaveBeenCalledWith({
        include: {
          user: { select: expect.any(Object) },
          account: true,
          noteProducts: { include: { product: true } },
        },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe('getNextNumberForAccount', () => {
    it('returns count + 1 for account', async () => {
      vi.mocked(prisma.note.count).mockResolvedValue(3);

      const result = await noteService.getNextNumberForAccount(1);

      expect(prisma.note.count).toHaveBeenCalledWith({ where: { accountId: 1 } });
      expect(result).toBe(4);
    });
  });

  describe('findById', () => {
    it('returns note when found', async () => {
      const mockNote = { id: 1, userId: 1, accountId: 1, numberNote: 1001, status: 'pending', checkin: null, checkout: null, user: mockUser, account: mockAccount, noteProducts: [] };
      vi.mocked(prisma.note.findUnique).mockResolvedValue(mockNote);

      const result = await noteService.findById(1);

      expect(prisma.note.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: { select: expect.any(Object) },
          account: true,
          noteProducts: { include: { product: true } },
        },
      });
      expect(result).toEqual(mockNote);
    });

    it('returns null when not found', async () => {
      vi.mocked(prisma.note.findUnique).mockResolvedValue(null);

      const result = await noteService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates note with required and optional fields', async () => {
      const mockCreated = { id: 1, userId: 1, accountId: 1, numberNote: 1001, status: 'pending', checkin: new Date('2026-02-14T12:00:00'), checkout: null };
      vi.mocked(prisma.note.create).mockResolvedValue(mockCreated);

      const result = await noteService.create({
        userId: 1,
        accountId: 1,
        numberNote: 1001,
        status: 'pending',
        checkin: new Date('2026-02-14T12:00:00'),
      });

      expect(prisma.note.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          accountId: 1,
          numberNote: 1001,
          status: 'pending',
          checkin: new Date('2026-02-14T12:00:00'),
          checkout: null,
        },
        include: {
          user: { select: expect.any(Object) },
          account: true,
          noteProducts: { include: { product: true } },
        },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('updates note with provided fields', async () => {
      const mockUpdated = { id: 1, userId: 1, accountId: 1, numberNote: 1001, status: 'completed', checkin: null, checkout: null };
      vi.mocked(prisma.note.update).mockResolvedValue(mockUpdated);

      const result = await noteService.update(1, { status: 'completed' });

      expect(prisma.note.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'completed' },
        include: {
          user: { select: expect.any(Object) },
          account: true,
          noteProducts: { include: { product: true } },
        },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('deletes note products first then note by id', async () => {
      vi.mocked(noteProductService.deleteByNoteId).mockResolvedValue(undefined);
      vi.mocked(prisma.note.delete).mockResolvedValue({ id: 1, userId: 1, accountId: 1, numberNote: 1, status: 'open', checkin: null, checkout: null });

      await noteService.remove(1);

      expect(noteProductService.deleteByNoteId).toHaveBeenCalledWith(1);
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('reduceStockForNote', () => {
    it('reduces stock for each product in note', async () => {
      vi.mocked(prisma.note.findUnique).mockResolvedValue({
        id: 1,
        noteProducts: [
          { productId: 10, amount: 2 },
          { productId: 20, amount: 1 },
        ],
      } as never);

      await noteService.reduceStockForNote(1);

      expect(productService.reduceStock).toHaveBeenCalledWith(10, 2);
      expect(productService.reduceStock).toHaveBeenCalledWith(20, 1);
    });

    it('aggregates amounts when same product appears multiple times', async () => {
      vi.mocked(prisma.note.findUnique).mockResolvedValue({
        id: 1,
        noteProducts: [
          { productId: 10, amount: 2 },
          { productId: 10, amount: 3 },
        ],
      } as never);

      await noteService.reduceStockForNote(1);

      expect(productService.reduceStock).toHaveBeenCalledWith(10, 5);
    });

    it('does nothing when note not found', async () => {
      vi.mocked(prisma.note.findUnique).mockResolvedValue(null);

      await noteService.reduceStockForNote(999);

      expect(productService.reduceStock).not.toHaveBeenCalled();
    });

    it('does nothing when note has no products', async () => {
      vi.mocked(prisma.note.findUnique).mockResolvedValue({
        id: 1,
        noteProducts: [],
      } as never);

      await noteService.reduceStockForNote(1);

      expect(productService.reduceStock).not.toHaveBeenCalled();
    });
  });

  describe('closeAllByAccountId', () => {
    it('closes all open notes for account', async () => {
      const checkoutDate = new Date('2026-02-14T18:00:00');
      vi.mocked(prisma.note.updateMany).mockResolvedValue({ count: 2 });

      await noteService.closeAllByAccountId(1, checkoutDate);

      expect(prisma.note.updateMany).toHaveBeenCalledWith({
        where: { accountId: 1, checkout: null },
        data: { checkout: checkoutDate, status: 'closed' },
      });
      expect(productService.reduceStock).not.toHaveBeenCalled();
    });
  });
});
