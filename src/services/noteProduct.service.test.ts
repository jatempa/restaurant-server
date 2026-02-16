import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as noteProductService from './noteProduct.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    $transaction: vi.fn(),
    noteProduct: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('NoteProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(prisma as never)
    );
  });

  describe('create', () => {
    it('creates note product with required fields', async () => {
      const mockCreated = {
        id: 1,
        noteId: 1,
        productId: 2,
        amount: 3,
        total: 75.0,
        note: { id: 1 },
        product: { id: 2, name: 'Cola', price: 25 },
      };
      vi.mocked(prisma.noteProduct.create).mockResolvedValue(mockCreated);
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });

      const result = await noteProductService.create({
        noteId: 1,
        productId: 2,
        amount: 3,
        total: 75.0,
      });

      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: { id: 2, stock: { gte: 3 } },
        data: { stock: { decrement: 3 } },
      });
      expect(prisma.noteProduct.create).toHaveBeenCalledWith({
        data: {
          noteId: 1,
          productId: 2,
          amount: 3,
          total: 75.0,
        },
        include: {
          note: true,
          product: true,
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it('uses default total of 0 when not provided', async () => {
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.noteProduct.create).mockResolvedValue({
        id: 1,
        noteId: 1,
        productId: 2,
        amount: 1,
        total: 0,
      });

      await noteProductService.create({
        noteId: 1,
        productId: 2,
        amount: 1,
      });

      expect(prisma.noteProduct.create).toHaveBeenCalledWith({
        data: {
          noteId: 1,
          productId: 2,
          amount: 1,
          total: 0,
        },
        include: {
          note: true,
          product: true,
        },
      });
    });

    it('throws insufficient stock when product stock is not enough', async () => {
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 0 });

      await expect(
        noteProductService.create({
          noteId: 1,
          productId: 2,
          amount: 3,
          total: 75,
        })
      ).rejects.toThrow('Insufficient stock');

      expect(prisma.noteProduct.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteByNoteAndProduct', () => {
    it('deletes note products and restores stock', async () => {
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([{ amount: 2 }, { amount: 3 }] as never);
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.product.update).mockResolvedValue({ id: 2 } as never);

      await noteProductService.deleteByNoteAndProduct(1, 2);

      expect(prisma.noteProduct.findMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
        select: { amount: true },
      });
      expect(prisma.noteProduct.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { stock: { increment: 5 } },
      });
    });

    it('does nothing when note product does not exist', async () => {
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([]);

      await noteProductService.deleteByNoteAndProduct(1, 2);

      expect(prisma.noteProduct.deleteMany).not.toHaveBeenCalled();
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteByNoteId', () => {
    it('deletes all note products for note', async () => {
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 3 });

      await noteProductService.deleteByNoteId(1);

      expect(prisma.noteProduct.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 1 },
      });
    });
  });

  describe('updateByNoteAndProduct', () => {
    it('deletes existing and creates new note product with updated amount', async () => {
      const mockProduct = { price: 25 };
      const mockCreated = {
        id: 1,
        noteId: 1,
        productId: 2,
        amount: 5,
        total: 125,
        note: { id: 1 },
        product: { id: 2, name: 'Cola', price: 25, stock: 100, categoryId: 1 },
      };
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([{ amount: 2 }] as never);
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
      vi.mocked(prisma.noteProduct.create).mockResolvedValue(mockCreated);

      const result = await noteProductService.updateByNoteAndProduct(1, 2, 5);

      expect(prisma.noteProduct.findMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
        select: { amount: true },
      });
      expect(prisma.product.updateMany).toHaveBeenCalledWith({
        where: { id: 2, stock: { gte: 3 } },
        data: { stock: { decrement: 3 } },
      });
      expect(prisma.noteProduct.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
      });
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
        select: { price: true },
      });
      expect(prisma.noteProduct.create).toHaveBeenCalledWith({
        data: {
          noteId: 1,
          productId: 2,
          amount: 5,
          total: 125,
        },
        include: {
          note: true,
          product: true,
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it('returns null when product not found', async () => {
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([{ amount: 1 }] as never);
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await noteProductService.updateByNoteAndProduct(1, 999, 5);

      expect(result).toBeNull();
      expect(prisma.noteProduct.create).not.toHaveBeenCalled();
    });

    it('throws insufficient stock when increasing amount beyond stock', async () => {
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([{ amount: 1 }] as never);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ price: 25 } as never);
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 0 });

      await expect(
        noteProductService.updateByNoteAndProduct(1, 2, 4)
      ).rejects.toThrow('Insufficient stock');

      expect(prisma.noteProduct.deleteMany).not.toHaveBeenCalled();
      expect(prisma.noteProduct.create).not.toHaveBeenCalled();
    });

    it('restores stock when amount decreases', async () => {
      vi.mocked(prisma.noteProduct.findMany).mockResolvedValue([{ amount: 5 }] as never);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ price: 25 } as never);
      vi.mocked(prisma.product.update).mockResolvedValue({ id: 2 } as never);
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.noteProduct.create).mockResolvedValue({
        id: 1,
        noteId: 1,
        productId: 2,
        amount: 2,
        total: 50,
      } as never);

      await noteProductService.updateByNoteAndProduct(1, 2, 2);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { stock: { increment: 3 } },
      });
    });
  });
});
