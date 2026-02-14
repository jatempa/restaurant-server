import { Router, type Request, type Response } from 'express';
import { prisma, userSelect, parseId } from '../lib/db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      include: { user: { select: userSelect } },
      orderBy: { id: 'asc' },
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Invalid account id' });

  try {
    const account = await prisma.account.findUnique({
      where: { id },
      include: { user: { select: userSelect }, notes: true },
    });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: 'Failed to fetch account' });
  }
});

export default router;
