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

export async function create(req: Request, res: Response) {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ message: 'name is required' });
    return;
  }
  const category = await categoryService.create({ name });
  res.status(201).json(category);
}

export async function update(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid category id' });
    return;
  }
  const existing = await categoryService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ message: 'name is required' });
    return;
  }
  const category = await categoryService.update(id, { name });
  res.json(category);
}

export async function remove(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid category id' });
    return;
  }
  const existing = await categoryService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }
  await categoryService.remove(id);
  res.status(204).send();
}
