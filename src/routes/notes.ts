import { Router, type Request, type Response } from 'express';
import { prisma, userSelect, parseId } from '../lib/db.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      include: {
        user: { select: userSelect },
        account: true,
        noteProducts: { include: { product: true } },
      },
      orderBy: { id: 'asc' },
    });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Invalid note id' });

  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
        account: true,
        noteProducts: { include: { product: true } },
      },
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
});

export default router;
