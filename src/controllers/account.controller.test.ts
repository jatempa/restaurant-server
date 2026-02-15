import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as accountController from './account.controller.js';
import { createMockRequest, createMockResponse } from '../test/utils.js';

vi.mock('../lib/db.js', () => ({
  parseId: vi.fn(),
}));

vi.mock('../services/account.service.js', () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';

describe('AccountController', () => {
  beforeEach(() => {
    vi.mocked(parseId).mockReturnValue(null);
  });

  describe('getAll', () => {
    it('returns all accounts', async () => {
      const mockAccounts = [
        {
          id: 1,
          userId: 1,
          name: 'Mesa 1',
          checkin: null,
          checkout: null,
          user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        },
      ];
      vi.mocked(accountService.findAll).mockResolvedValue(mockAccounts);

      const req = createMockRequest();
      const res = createMockResponse();

      await accountController.getAll(req, res);

      expect(accountService.findAll).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockAccounts);
    });
  });

  describe('getById', () => {
    it('returns 400 for invalid id', async () => {
      vi.mocked(parseId).mockReturnValue(null);

      const req = createMockRequest({ params: { id: 'abc' } });
      const res = createMockResponse();

      await accountController.getById(req, res);

      expect(res.statusCode).toBe(400);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual({ message: 'Invalid account id' });
    });

    it('returns 404 when account not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(null);

      const req = createMockRequest({ params: { id: '1' } });
      const res = createMockResponse();

      await accountController.getById(req, res);

      expect(res.statusCode).toBe(404);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual({ message: 'Account not found' });
    });

    it('returns account when found', async () => {
      const mockAccount = {
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);

      const req = createMockRequest({ params: { id: '1' } });
      const res = createMockResponse();

      await accountController.getById(req, res);

      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockAccount);
    });
  });

  describe('create', () => {
    it('returns 400 when userId is missing', async () => {
      const req = createMockRequest({ body: {} });
      const res = createMockResponse();

      await accountController.create(req, res);

      expect(res.statusCode).toBe(400);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual({ message: 'userId is required' });
    });

    it('creates account and returns 201', async () => {
      const mockCreated = {
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
      };
      vi.mocked(accountService.create).mockResolvedValue(mockCreated);

      const req = createMockRequest({ body: { userId: 1, name: 'Mesa 1' } });
      const res = createMockResponse();

      await accountController.create(req, res);

      expect(accountService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1, name: 'Mesa 1' })
      );
      expect(res.statusCode).toBe(201);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('returns 400 for invalid id', async () => {
      vi.mocked(parseId).mockReturnValue(null);

      const req = createMockRequest({ params: { id: 'abc' } });
      const res = createMockResponse();

      await accountController.update(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when account not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(null);

      const req = createMockRequest({ params: { id: '1' }, body: { name: 'Mesa 2' } });
      const res = createMockResponse();

      await accountController.update(req, res);

      expect(res.statusCode).toBe(404);
    });

    it('updates account and returns 200', async () => {
      const mockFindById = {
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      };
      const mockUpdated = {
        id: 1,
        userId: 1,
        name: 'Mesa 2',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(mockFindById);
      vi.mocked(accountService.update).mockResolvedValue(mockUpdated);

      const req = createMockRequest({ params: { id: '1' }, body: { name: 'Mesa 2' } });
      const res = createMockResponse();

      await accountController.update(req, res);

      expect(accountService.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Mesa 2' }));
      expect(res.statusCode).toBe(200);
    });
  });

  describe('remove', () => {
    it('returns 400 for invalid id', async () => {
      vi.mocked(parseId).mockReturnValue(null);

      const req = createMockRequest({ params: { id: 'abc' } });
      const res = createMockResponse();

      await accountController.remove(req, res);

      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when account not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(null);

      const req = createMockRequest({ params: { id: '1' } });
      const res = createMockResponse();

      await accountController.remove(req, res);

      expect(res.statusCode).toBe(404);
    });

    it('deletes account and returns 204', async () => {
      const mockFindById = {
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(accountService.findById).mockResolvedValue(mockFindById);
      vi.mocked(accountService.remove).mockResolvedValue({
        id: 1,
        userId: 1,
        name: null,
        checkin: null,
        checkout: null,
      });

      const req = createMockRequest({ params: { id: '1' } });
      const res = createMockResponse();

      await accountController.remove(req, res);

      expect(accountService.remove).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(204);
    });
  });
});
