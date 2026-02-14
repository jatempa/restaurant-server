import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';

export async function getAll(_req: Request, res: Response) {
  const accounts = await accountService.findAll();
  res.json(accounts);
}

export async function getById(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const account = await accountService.findById(id);
  if (!account) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  res.json(account);
}

export async function create(req: Request, res: Response) {
  const { userId, name, checkin, checkout } = req.body;
  if (userId === undefined || userId === null) {
    res.status(400).json({ message: 'userId is required' });
    return;
  }
  const account = await accountService.create({
    userId: Number(userId),
    ...(name !== undefined && { name }),
    ...(checkin && { checkin: new Date(checkin) }),
    ...(checkout && { checkout: new Date(checkout) }),
  });
  res.status(201).json(account);
}

export async function update(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const existing = await accountService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  const { name, checkin, checkout } = req.body;
  const account = await accountService.update(id, {
    ...(name !== undefined && { name }),
    ...(checkin !== undefined && { checkin: checkin ? new Date(checkin) : null }),
    ...(checkout !== undefined && { checkout: checkout ? new Date(checkout) : null }),
  });
  res.json(account);
}

export async function remove(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid account id' });
    return;
  }
  const existing = await accountService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }
  await accountService.remove(id);
  res.status(204).send();
}
