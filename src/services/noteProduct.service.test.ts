import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as noteProductService from './noteProduct.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    noteProduct: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

describe('NoteProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      const result = await noteProductService.create({
        noteId: 1,
        productId: 2,
        amount: 3,
        total: 75.0,
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
  });

  describe('deleteByNoteAndProduct', () => {
    it('deletes all note products for note and product', async () => {
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 2 });

      await noteProductService.deleteByNoteAndProduct(1, 2);

      expect(prisma.noteProduct.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
      });
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
      const mockProduct = {
        id: 2,
        name: 'Cola',
        price: 25,
        stock: 100,
        categoryId: 1,
      };
      const mockCreated = {
        id: 1,
        noteId: 1,
        productId: 2,
        amount: 5,
        total: 125,
        note: { id: 1 },
        product: mockProduct,
      };
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
      vi.mocked(prisma.noteProduct.create).mockResolvedValue(mockCreated);

      const result = await noteProductService.updateByNoteAndProduct(1, 2, 5);

      expect(prisma.noteProduct.deleteMany).toHaveBeenCalledWith({
        where: { noteId: 1, productId: 2 },
      });
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
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
      vi.mocked(prisma.noteProduct.deleteMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await noteProductService.updateByNoteAndProduct(1, 999, 5);

      expect(result).toBeNull();
      expect(prisma.noteProduct.create).not.toHaveBeenCalled();
    });
  });
});
