import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as categoryController from './category.controller.js';
import { createMockRequest, createMockResponse } from '../test/utils.js';

vi.mock('../lib/db.js', () => ({ parseId: vi.fn() }));
vi.mock('../services/category.service.js', () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import { parseId } from '../lib/db.js';
import * as categoryService from '../services/category.service.js';

describe('CategoryController', () => {
  beforeEach(() => {
    vi.mocked(parseId).mockReturnValue(null);
  });

  describe('getAll', () => {
    it('returns all categories', async () => {
      const mockCategories = [{ id: 1, name: 'Bebidas', products: [] }];
      vi.mocked(categoryService.findAll).mockResolvedValue(mockCategories);

      const res = createMockResponse();
      await categoryController.getAll(createMockRequest(), res);

      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockCategories);
    });
  });

  describe('getById', () => {
    it('returns 400 for invalid id', async () => {
      const res = createMockResponse();
      await categoryController.getById(createMockRequest({ params: { id: 'x' } }), res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await categoryController.getById(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(404);
    });

    it('returns category when found', async () => {
      const mockCategory = { id: 1, name: 'Bebidas', products: [] };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue(mockCategory);
      const res = createMockResponse();
      await categoryController.getById(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockCategory);
    });
  });

  describe('create', () => {
    it('returns 400 when name is missing', async () => {
      const res = createMockResponse();
      await categoryController.create(createMockRequest({ body: {} }), res);
      expect(res.statusCode).toBe(400);
    });

    it('creates category and returns 201', async () => {
      const mockCreated = { id: 1, name: 'Bebidas', products: [] };
      vi.mocked(categoryService.create).mockResolvedValue(mockCreated);
      const res = createMockResponse();
      await categoryController.create(createMockRequest({ body: { name: 'Bebidas' } }), res);
      expect(categoryService.create).toHaveBeenCalledWith({ name: 'Bebidas' });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('update', () => {
    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await categoryController.update(
        createMockRequest({ params: { id: '1' }, body: { name: 'New' } }),
        res
      );
      expect(res.statusCode).toBe(404);
    });

    it('updates and returns 200', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue({ id: 1, name: 'Bebidas', products: [] });
      vi.mocked(categoryService.update).mockResolvedValue({ id: 1, name: 'New', products: [] });
      const res = createMockResponse();
      await categoryController.update(
        createMockRequest({ params: { id: '1' }, body: { name: 'New' } }),
        res
      );
      expect(res.statusCode).toBe(200);
    });
  });

  describe('remove', () => {
    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await categoryController.remove(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(404);
    });

    it('deletes and returns 204', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(categoryService.findById).mockResolvedValue({ id: 1, name: 'Bebidas', products: [] });
      const res = createMockResponse();
      await categoryController.remove(createMockRequest({ params: { id: '1' } }), res);
      expect(categoryService.remove).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(204);
    });
  });
});
