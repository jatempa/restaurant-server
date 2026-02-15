import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productController from './product.controller.js';
import { createMockRequest, createMockResponse } from '../test/utils.js';

vi.mock('../lib/db.js', () => ({ parseId: vi.fn() }));
vi.mock('../services/product.service.js', () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import { parseId } from '../lib/db.js';
import * as productService from '../services/product.service.js';

describe('ProductController', () => {
  beforeEach(() => {
    vi.mocked(parseId).mockReturnValue(null);
  });

  describe('getAll', () => {
    it('returns all products', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Coca Cola',
          price: 25.5,
          stock: 100,
          categoryId: 1,
          category: { id: 1, name: 'Bebidas' },
        },
      ];
      vi.mocked(productService.findAll).mockResolvedValue(mockProducts);
      const res = createMockResponse();
      await productController.getAll(createMockRequest(), res);
      expect(productService.findAll).toHaveBeenCalledWith(undefined);
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockProducts);
    });

    it('filters by categoryId when query param provided', async () => {
      const mockProducts = [{ id: 1, name: 'Cola', price: 25, stock: 100, categoryId: 1, category: { id: 1 } }];
      vi.mocked(productService.findAll).mockResolvedValue(mockProducts);
      const res = createMockResponse();
      await productController.getAll(createMockRequest({ query: { categoryId: '1' } }), res);
      expect(productService.findAll).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('getById', () => {
    it('returns 400 for invalid id', async () => {
      const res = createMockResponse();
      await productController.getById(createMockRequest({ params: { id: 'x' } }), res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(productService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await productController.getById(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('create', () => {
    it('returns 400 when name is missing', async () => {
      const res = createMockResponse();
      await productController.create(
        createMockRequest({ body: { price: 25, stock: 100, categoryId: 1 } }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when price is missing', async () => {
      const res = createMockResponse();
      await productController.create(
        createMockRequest({ body: { name: 'Cola', stock: 100, categoryId: 1 } }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when stock is missing', async () => {
      const res = createMockResponse();
      await productController.create(
        createMockRequest({ body: { name: 'Cola', price: 25, categoryId: 1 } }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('creates product and returns 201', async () => {
      const mockCreated = {
        id: 1,
        name: 'Coca Cola',
        price: 25.5,
        stock: 100,
        categoryId: 1,
        category: { id: 1, name: 'Bebidas' },
      };
      vi.mocked(productService.create).mockResolvedValue(mockCreated);
      const res = createMockResponse();
      await productController.create(
        createMockRequest({
          body: { name: 'Coca Cola', price: 25.5, stock: 100, categoryId: 1 },
        }),
        res
      );
      expect(productService.create).toHaveBeenCalledWith({
        name: 'Coca Cola',
        price: 25.5,
        stock: 100,
        categoryId: 1,
      });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('update', () => {
    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(productService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await productController.update(
        createMockRequest({ params: { id: '1' }, body: { name: 'Pepsi' } }),
        res
      );
      expect(res.statusCode).toBe(404);
    });

    it('updates product stock and returns 200', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(productService.findById).mockResolvedValue({
        id: 1,
        name: 'Cola',
        price: 25,
        stock: 100,
        categoryId: 1,
        category: { id: 1, name: 'Bebidas' },
      });
      const mockUpdated = {
        id: 1,
        name: 'Cola',
        price: 25,
        stock: 75,
        categoryId: 1,
        category: { id: 1, name: 'Bebidas' },
      };
      vi.mocked(productService.update).mockResolvedValue(mockUpdated);
      const res = createMockResponse();
      await productController.update(
        createMockRequest({ params: { id: '1' }, body: { stock: 75 } }),
        res
      );
      expect(productService.update).toHaveBeenCalledWith(1, { stock: 75 });
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockUpdated);
    });
  });

  describe('remove', () => {
    it('deletes and returns 204', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(productService.findById).mockResolvedValue({
        id: 1,
        name: 'Coca Cola',
        price: 25.5,
        stock: 100,
        categoryId: 1,
        category: { id: 1, name: 'Bebidas' },
      });
      const res = createMockResponse();
      await productController.remove(createMockRequest({ params: { id: '1' } }), res);
      expect(productService.remove).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(204);
    });
  });
});
