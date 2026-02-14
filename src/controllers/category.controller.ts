import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as categoryService from '../services/category.service.js';

export async function getAll(_req: Request, res: Response) {
  const categories = await categoryService.findAll();
  res.json(categories);
}

export async function getById(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid category id' });
    return;
  }
  const category = await categoryService.findById(id);
  if (!category) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  res.json(category);
}
