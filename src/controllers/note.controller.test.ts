import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as noteController from './note.controller.js';
import { createMockRequest, createMockResponse } from '../test/utils.js';

vi.mock('../lib/db.js', () => ({ parseId: vi.fn() }));
vi.mock('../services/account.service.js', () => ({
  findById: vi.fn(),
}));
vi.mock('../services/note.service.js', () => ({
  findAll: vi.fn(),
  findByAccountId: vi.fn(),
  getNextNumberForAccount: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';
import * as noteService from '../services/note.service.js';

describe('NoteController', () => {
  beforeEach(() => {
    vi.mocked(parseId).mockReturnValue(null);
  });

  describe('getAll', () => {
    it('returns all notes', async () => {
      const mockNotes = [
        {
          id: 1,
          userId: 1,
          accountId: 1,
          numberNote: 1001,
          status: 'pending',
          checkin: null,
          checkout: null,
          user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
          account: { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null },
          noteProducts: [],
        },
      ];
      vi.mocked(noteService.findAll).mockResolvedValue(mockNotes);
      const res = createMockResponse();
      await noteController.getAll(createMockRequest(), res);
      expect(res.statusCode).toBe(200);
      expect((res as { _jsonData?: unknown })._jsonData).toEqual(mockNotes);
    });
  });

  describe('getById', () => {
    it('returns 400 for invalid id', async () => {
      const res = createMockResponse();
      await noteController.getById(createMockRequest({ params: { id: 'x' } }), res);
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await noteController.getById(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('create', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = createMockResponse();
      await noteController.create(
        createMockRequest({ body: { accountId: 1 } }),
        res
      );
      expect(res.statusCode).toBe(401);
    });

    it('returns 400 when accountId is missing', async () => {
      const res = createMockResponse();
      await noteController.create(
        createMockRequest({ body: {}, user: { sub: 1, email: 'u@x.com' } }),
        res
      );
      expect(res.statusCode).toBe(400);
    });

    it('creates note and returns 201', async () => {
      const mockAccount = {
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      };
      const mockCreated = {
        id: 1,
        userId: 1,
        accountId: 1,
        numberNote: 1,
        status: 'open',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        account: mockAccount,
        noteProducts: [],
      };
      vi.mocked(accountService.findById).mockResolvedValue(mockAccount);
      vi.mocked(noteService.getNextNumberForAccount).mockResolvedValue(1);
      vi.mocked(noteService.create).mockResolvedValue(mockCreated);
      const res = createMockResponse();
      await noteController.create(
        createMockRequest({
          body: { accountId: 1 },
          user: { sub: 1, email: 'u@x.com' },
        }),
        res
      );
      expect(noteService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          accountId: 1,
          numberNote: 1,
          status: 'open',
        })
      );
      expect(res.statusCode).toBe(201);
    });
  });

  describe('update', () => {
    it('returns 404 when not found', async () => {
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(null);
      const res = createMockResponse();
      await noteController.update(
        createMockRequest({ params: { id: '1' }, body: { status: 'completed' } }),
        res
      );
      expect(res.statusCode).toBe(404);
    });
  });

  describe('remove', () => {
    it('returns 401 when unauthenticated', async () => {
      const mockNote = {
        id: 1,
        accountId: 1,
        userId: 1,
        numberNote: 1,
        status: 'open',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        account: { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null },
        noteProducts: [],
      };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      const res = createMockResponse();
      await noteController.remove(createMockRequest({ params: { id: '1' } }), res);
      expect(res.statusCode).toBe(401);
    });

    it('deletes and returns 204', async () => {
      const mockNote = {
        id: 1,
        userId: 1,
        accountId: 1,
        numberNote: 1001,
        status: 'pending',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        account: { id: 1, userId: 1, name: 'Mesa 1', checkin: null, checkout: null },
        noteProducts: [],
      };
      vi.mocked(parseId).mockReturnValue(1);
      vi.mocked(noteService.findById).mockResolvedValue(mockNote);
      vi.mocked(accountService.findById).mockResolvedValue({
        id: 1,
        userId: 1,
        name: 'Mesa 1',
        checkin: null,
        checkout: null,
        user: { id: 1, name: 'User', email: 'user@example.com', firstLastName: 'User' },
        notes: [],
      });
      const res = createMockResponse();
      await noteController.remove(
        createMockRequest({ params: { id: '1' }, user: { sub: 1, email: 'u@x.com' } }),
        res
      );
      expect(noteService.remove).toHaveBeenCalledWith(1);
      expect(res.statusCode).toBe(204);
    });
  });
});
