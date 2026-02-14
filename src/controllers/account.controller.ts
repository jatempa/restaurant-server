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
