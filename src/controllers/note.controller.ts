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
