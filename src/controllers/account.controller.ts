import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';
import * as noteService from '../services/note.service.js';

export async function getAll(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const accounts = await accountService.findByUserId(userId);
  res.json(accounts);
}

export async function getById(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const account = await accountService.findById(id);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  res.json(account);
}

export async function create(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const { name, checkout } = req.body;
  const account = await accountService.create({
    userId,
    ...(name !== undefined && { name }),
    checkin: new Date(),
    ...(checkout && { checkout: new Date(checkout) }),
  });
  res.status(201).json(account);
}

export async function update(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const existing = await accountService.findById(id);
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  if (existing.checkout) {
    res.status(404).json({ message: 'Account is closed' });
    return;
  }
  const { name, checkin, checkout } = req.body;
  if (checkout !== undefined && checkout !== null) {
    const checkoutDate = new Date(checkout);
    await noteService.closeAllByAccountId(id, checkoutDate);
  }
  const account = await accountService.update(id, {
    ...(name !== undefined && { name }),
    ...(checkin !== undefined && { checkin: checkin ? new Date(checkin) : null }),
    ...(checkout !== undefined && { checkout: checkout ? new Date(checkout) : null }),
  });
  res.json(account);
}

export async function remove(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const existing = await accountService.findById(id);
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  await accountService.remove(id);
  res.status(204).send();
}
