import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as noteService from '../services/note.service.js';

export async function getAll(_req: Request, res: Response) {
  const notes = await noteService.findAll();
  res.json(notes);
}

export async function getById(req: Request, res: Response) {
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
  res.json(note);
}

export async function create(req: Request, res: Response) {
  const { userId, accountId, numberNote, status, checkin, checkout } = req.body;
  if (userId === undefined || userId === null) {
    res.status(400).json({ message: 'userId is required' });
    return;
  }
  if (accountId === undefined || accountId === null) {
    res.status(400).json({ message: 'accountId is required' });
    return;
  }
  if (numberNote === undefined || numberNote === null) {
    res.status(400).json({ message: 'numberNote is required' });
    return;
  }
  if (!status || typeof status !== 'string') {
    res.status(400).json({ message: 'status is required' });
    return;
  }
  const note = await noteService.create({
    userId: Number(userId),
    accountId: Number(accountId),
    numberNote: Number(numberNote),
    status,
    ...(checkin && { checkin: new Date(checkin) }),
    ...(checkout && { checkout: new Date(checkout) }),
  });
  res.status(201).json(note);
}

export async function update(req: Request, res: Response) {
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
  const { userId, accountId, numberNote, status, checkin, checkout } = req.body;
  const note = await noteService.update(id, {
    ...(userId !== undefined && { userId: Number(userId) }),
    ...(accountId !== undefined && { accountId: Number(accountId) }),
    ...(numberNote !== undefined && { numberNote: Number(numberNote) }),
    ...(status !== undefined && { status }),
    ...(checkin !== undefined && { checkin: checkin ? new Date(checkin) : null }),
    ...(checkout !== undefined && { checkout: checkout ? new Date(checkout) : null }),
  });
  res.json(note);
}

export async function remove(req: Request, res: Response) {
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
  await noteService.remove(id);
  res.status(204).send();
}
