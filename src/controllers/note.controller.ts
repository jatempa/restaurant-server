import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';
import * as noteService from '../services/note.service.js';

export async function getAll(req: Request, res: Response) {
  const accountIdParam = req.query.accountId;
  if (accountIdParam !== undefined && accountIdParam !== '') {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    const accountId = Number(accountIdParam);
    if (Number.isNaN(accountId)) {
      res.status(400).json({ message: 'Invalid accountId' });
      return;
    }
    const account = await accountService.findById(accountId);
    if (!account || account.userId !== userId) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }
    const notes = await noteService.findByAccountId(accountId);
    res.json(notes);
    return;
  }
  const notes = await noteService.findAll();
  res.json(notes);
}

export async function getById(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid note id' });
    return;
  }
  const note = await noteService.findById(id);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const account = await accountService.findById(note.accountId);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  if (note.checkout || account.checkout) {
    res.status(404).json({ message: 'Note is closed' });
    return;
  }
  res.json(note);
}

export async function create(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const { accountId, status, checkout } = req.body;
  if (accountId === undefined || accountId === null) {
    res.status(400).json({ message: 'accountId is required' });
    return;
  }
  const accountIdNum = Number(accountId);
  const account = await accountService.findById(accountIdNum);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  if (account.checkout) {
    res.status(404).json({ message: 'Account is closed' });
    return;
  }
  const numberNote = await noteService.getNextNumberForAccount(accountIdNum);
  const note = await noteService.create({
    userId,
    accountId: accountIdNum,
    numberNote,
    status: status && typeof status === 'string' ? status : 'open',
    checkin: new Date(),
    ...(checkout && { checkout: new Date(checkout) }),
  });
  res.status(201).json(note);
}

export async function update(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid note id' });
    return;
  }
  const existing = await noteService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const account = await accountService.findById(existing.accountId);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  if (existing.checkout || account.checkout) {
    res.status(404).json({ message: 'Note is closed' });
    return;
  }
  const { userId: _userId, accountId, numberNote, status, checkin, checkout } = req.body;
  const note = await noteService.update(id, {
    ...(_userId !== undefined && { userId: Number(_userId) }),
    ...(accountId !== undefined && { accountId: Number(accountId) }),
    ...(numberNote !== undefined && { numberNote: Number(numberNote) }),
    ...(status !== undefined && { status }),
    ...(checkin !== undefined && { checkin: checkin ? new Date(checkin) : null }),
    ...(checkout !== undefined && { checkout: checkout ? new Date(checkout) : null }),
  });
  res.json(note);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid note id' });
    return;
  }
  const existing = await noteService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const account = await accountService.findById(existing.accountId);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  await noteService.remove(id);
  res.status(204).send();
}
