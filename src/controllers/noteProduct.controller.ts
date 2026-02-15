import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as accountService from '../services/account.service.js';
import * as noteService from '../services/note.service.js';
import * as productService from '../services/product.service.js';
import * as noteProductService from '../services/noteProduct.service.js';

export async function addProduct(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const noteId = parseId(req.params.noteId);
  if (noteId === null) {
    res.status(400).json({ message: 'Invalid note id' });
    return;
  }
  const { productId, amount } = req.body;
  if (productId === undefined || productId === null) {
    res.status(400).json({ message: 'productId is required' });
    return;
  }
  if (amount === undefined || amount === null || Number(amount) < 1) {
    res.status(400).json({ message: 'amount must be at least 1' });
    return;
  }
  const note = await noteService.findById(noteId);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const account = await accountService.findById(note.accountId);
  if (!account || account.userId !== userId) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const product = await productService.findById(Number(productId));
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  const total = product.price * Number(amount);
  const noteProduct = await noteProductService.create({
    noteId,
    productId: product.id,
    amount: Number(amount),
    total,
  });
  res.status(201).json(noteProduct);
}

async function verifyNoteOwnership(userId: number, noteId: number) {
  const note = await noteService.findById(noteId);
  if (!note) return null;
  const account = await accountService.findById(note.accountId);
  if (!account || account.userId !== userId) return null;
  return { note };
}

export async function updateProduct(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const noteId = parseId(req.params.noteId);
  const productId = parseId(req.params.productId);
  if (noteId === null || productId === null) {
    res.status(400).json({ message: 'Invalid note or product id' });
    return;
  }
  const verified = await verifyNoteOwnership(userId, noteId);
  if (!verified) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  const { amount } = req.body;
  if (amount === undefined || amount === null || Number(amount) < 1) {
    res.status(400).json({ message: 'amount must be at least 1' });
    return;
  }
  const updated = await noteProductService.updateByNoteAndProduct(
    noteId,
    productId,
    Number(amount)
  );
  if (!updated) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json(updated);
}

export async function removeProduct(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }
  const noteId = parseId(req.params.noteId);
  const productId = parseId(req.params.productId);
  if (noteId === null || productId === null) {
    res.status(400).json({ message: 'Invalid note or product id' });
    return;
  }
  const verified = await verifyNoteOwnership(userId, noteId);
  if (!verified) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  await noteProductService.deleteByNoteAndProduct(noteId, productId);
  res.status(204).send();
}
