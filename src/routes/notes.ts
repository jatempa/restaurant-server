import { Router, type Request, type Response } from 'express';
import { parseId } from '../lib/db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as noteService from '../services/note.service.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const notes = await noteService.findAll();
    res.json(notes);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

export default router;
