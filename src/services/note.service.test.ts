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
      delete: vi.fn(),
    },
  },
  userSelect: { id: true, email: true, name: true, firstLastName: true },
}));
vi.mock('./noteProduct.service.js', () => ({
  deleteByNoteId: vi.fn(),
}));

import * as noteProductService from './noteProduct.service.js';

describe('NoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all notes with user, account and products', async () => {
      const mockNotes = [{ id: 1, numberNote: 1001, user: {}, account: {}, noteProducts: [] }];
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

  describe('findById', () => {
    it('returns note when found', async () => {
      const mockNote = { id: 1, numberNote: 1001, user: {}, account: {}, noteProducts: [] };
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
      const mockCreated = { id: 1, numberNote: 1001, status: 'pending' };
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
      const mockUpdated = { id: 1, status: 'completed' };
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
      vi.mocked(prisma.note.delete).mockResolvedValue({ id: 1 });

      await noteService.remove(1);

      expect(noteProductService.deleteByNoteId).toHaveBeenCalledWith(1);
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
