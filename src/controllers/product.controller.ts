import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as productService from '../services/product.service.js';

export async function getAll(_req: Request, res: Response) {
  const products = await productService.findAll();
  res.json(products);
}

export async function getById(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }
  const product = await productService.findById(id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json(product);
}
