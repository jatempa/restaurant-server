import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db.js';
import * as productService from './product.service.js';

vi.mock('../lib/db.js', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all products with category', async () => {
      const mockProducts = [{ id: 1, name: 'Coca Cola', price: 25.5, stock: 100, categoryId: 1, category: { id: 1 } }];
      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

      const result = await productService.findAll();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { category: true },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('filters by categoryId when provided', async () => {
      const mockProducts = [{ id: 1, name: 'Cola', price: 25, stock: 100, categoryId: 1, category: { id: 1 } }];
      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

      const result = await productService.findAll(1);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: 1 },
        include: { category: true },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findById', () => {
    it('returns product when found', async () => {
      const mockProduct = { id: 1, name: 'Coca Cola', price: 25.5, stock: 100, categoryId: 1, category: { id: 1 } };
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);

      const result = await productService.findById(1);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true },
      });
      expect(result).toEqual(mockProduct);
    });

    it('returns null when not found', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await productService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates product with all fields', async () => {
      const mockCreated = { id: 1, name: 'Coca Cola', price: 25.5, stock: 100, categoryId: 1 };
      vi.mocked(prisma.product.create).mockResolvedValue(mockCreated);

      const result = await productService.create({
        name: 'Coca Cola',
        price: 25.5,
        stock: 100,
        categoryId: 1,
      });

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: 'Coca Cola',
          price: 25.5,
          stock: 100,
          categoryId: 1,
        },
        include: { category: true },
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('updates product with partial data', async () => {
      const mockUpdated = { id: 1, name: 'Pepsi', price: 25.5, stock: 80, categoryId: 1 };
      vi.mocked(prisma.product.update).mockResolvedValue(mockUpdated);

      const result = await productService.update(1, { name: 'Pepsi', stock: 80 });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Pepsi', stock: 80 },
        include: { category: true },
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('deletes product by id', async () => {
      vi.mocked(prisma.product.delete).mockResolvedValue({ id: 1, name: 'Cola', price: 25, stock: 100, categoryId: 1 });

      await productService.remove(1);

      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
