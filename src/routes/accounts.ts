import { Router, type Request, type Response } from 'express';
import { parseId } from '../lib/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as accountService from '../services/account.service.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const accounts = await accountService.findAll();
    res.json(accounts);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

export default router;
