import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as noteProductController from './noteProduct.controller.js';
import { createMockRequest, createMockResponse } from '../test/utils.js';

vi.mock('../lib/db.js', () => ({ parseId: vi.fn() }));
vi.mock('../services/account.service.js', () => ({
  findById: vi.fn(),
}));
vi.mock('../services/note.service.js', () => ({
  findById: vi.fn(),
}));
vi.mock('../services/product.service.js', () => ({
  findById: vi.fn(),
}));
vi.mock('../services/noteProduct.service.js', () => ({
  create: vi.fn(),
  updateByNoteAndProduct: vi.fn(),
  deleteByNoteAndProduct: vi.fn(),
}));

import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';
import * as noteService from '../services/note.service.js';
import * as productService from '../services/product.service.js';
import * as noteProductService from '../services/noteProduct.service.js';

const mockNote = {
  id: 1,
  accountId: 1,
  userId: 1,
  numberNote: 1,
  status: 'open',
  checkin: null,
  checkout: null,
  user: { id: 1, name: 'User', email: 'u@x.com', firstLastName: 'User' },
  account: { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null },
  noteProducts: [],
};

const mockAccount = {
  id: 1,
  userId: 1,
  name: 'Mesa 1',
  checkin: null,
  checkout: null,
  user: { id: 1, name: 'User', email: 'u@x.com', firstLastName: 'User' },
  notes: [],
};

const mockProduct = {
  id: 2,
  name: 'Cola',
  price: 25,
  stock: 100,
  categoryId: 1,
  category: { id: 1, name: 'Bebidas' },
};

const mockNoteProduct = {
  id: 1,
  noteId: 1,
  productId: 2,
  amount: 3,
  total: 75,
  note: mockNote,
  product: mockProduct,
};

function mockParseId() {
  vi.mocked(parseId).mockImplementation((id) => {
    const str = typeof id === 'string' ? id : undefined;
    if (!str) return null;
    const n = parseInt(str, 10);
    return Number.isNaN(n) ? null : n;
  });
}

describe('NoteProductController', () => {
  beforeEach(() => {
    mockParseId();
  });

  describe('addProduct', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 2, amount: 3 },
        }),
        res
      );
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when noteId is invalid', async () => {
      mockParseId();
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: 'x' },
          body: { productId: 2, amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when productId is missing', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when amount is less than 1', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 2, amount: 0 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when note not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 2, amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when account does not belong to user', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue({
        ...mockAccount,
        userId: 999,
      });
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 2, amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when product not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      vi.mocked(productService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 999, amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(404);
    });

    it('creates note product and returns 201', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      vi.mocked(productService.findById).mockResolvedValue(mockProduct);
      vi.mocked(noteProductService.create).mockResolvedValue(mockNoteProduct);
      const res = createMockResponse();
      await noteProductController.addProduct(
        createMockRequest({
          params: { noteId: '1' },
          body: { productId: 2, amount: 3 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(noteProductService.create).toHaveBeenCalledWith({
        noteId: 1,
        productId: 2,
        amount: 3,
        total: 75,
      });
      expect(res.statusCode).toBe(201);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockNoteProduct);
    });
  });

  describe('updateProduct', () => {
    it('returns 401 when unauthenticated', async () => {
      mockParseId();
      const res = createMockResponse();
      await noteProductController.updateProduct(
        createMockRequest({
          params: { noteId: '1', productId: '2' },
          body: { amount: 5 },
        }),
        res
      );
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when ids are invalid', async () => {
      vi.mocked(parseId).mockReturnValue(null);
      const res = createMockResponse();
      await noteProductController.updateProduct(
        createMockRequest({
          params: { noteId: 'x', productId: '2' },
          body: { amount: 5 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when amount is invalid', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      const res = createMockResponse();
      await noteProductController.updateProduct(
        createMockRequest({
          params: { noteId: '1', productId: '2' },
          body: { amount: 0 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('updates note product and returns 200', async () => {
      mockParseId();
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      const updatedNoteProduct = {
        ...mockNoteProduct,
        amount: 5,
        total: 125,
      };
      vi.mocked(noteProductService.updateByNoteAndProduct).mockResolvedValue(
        updatedNoteProduct
      );
      const res = createMockResponse();
      await noteProductController.updateProduct(
        createMockRequest({
          params: { noteId: '1', productId: '2' },
          body: { amount: 5 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(noteProductService.updateByNoteAndProduct).toHaveBeenCalledWith(
        1,
        2,
        5
      );
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(
        updatedNoteProduct
      );
    });
  });

  describe('removeProduct', () => {
    it('returns 401 when unauthenticated', async () => {
      mockParseId();
      const res = createMockResponse();
      await noteProductController.removeProduct(
        createMockRequest({
          params: { noteId: '1', productId: '2' },
        }),
        res
      );
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when ids are invalid', async () => {
      vi.mocked(parseId).mockReturnValue(null);
      const res = createMockResponse();
      await noteProductController.removeProduct(
        createMockRequest({
          params: { noteId: 'x', productId: '2' },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('deletes note products and returns 204', async () => {
      vi.mocked(parseId).mockImplementation((id) => Number(id) || 1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      const res = createMockResponse();
      await noteProductController.removeProduct(
        createMockRequest({
          params: { noteId: '1', productId: '2' },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(noteProductService.deleteByNoteAndProduct).toHaveBeenCalledWith(
        1,
        2
      );
      expect(res.statusCode).toBe(204);
    });
  });
});
