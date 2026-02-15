import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as categoryService from './category.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all categories with products', async () => {
      const mockCategories = [{ id: 1, name: 'Bebidas', products: [] }];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      const result = await categoryService.findAll();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: { products: true },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findById', () => {
    it('returns category when found', async () => {
      const mockCategory = { id: 1, name: 'Bebidas', products: [] };
      vi.mocked(prisma.category.findUnique).mockResolvedValue(mockCategory);

      const result = await categoryService.findById(1);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { products: true },
      });
      expect(result).toEqual(mockCategory);
    });

    it('returns null when not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const result = await categoryService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates category with name', async () => {
      const mockCreated = { id: 1, name: 'Bebidas', products: [] };
      vi.mocked(prisma.category.create).mockResolvedValue(mockCreated);

      const result = await categoryService.create({ name: 'Bebidas' });

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Bebidas' },
        include: { products: true },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('updates category name', async () => {
      const mockUpdated = { id: 1, name: 'Bebidas y Refrescos', products: [] };
      vi.mocked(prisma.category.update).mockResolvedValue(mockUpdated);

      const result = await categoryService.update(1, { name: 'Bebidas y Refrescos' });

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Bebidas y Refrescos' },
        include: { products: true },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('deletes category by id', async () => {
      vi.mocked(prisma.category.delete).mockResolvedValue({ id: 1 } as never);

      await categoryService.remove(1);

      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
