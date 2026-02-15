import type { Request, Response } from 'express';
import { parseId } from '../lib/db.js';
import * as productService from '../services/product.service.js';

export async function getAll(req: Request, res: Response) {
  const categoryIdParam = req.query.categoryId;
  let categoryId: number | undefined;
  if (categoryIdParam !== undefined && categoryIdParam !== '') {
    const n = Number(categoryIdParam);
    if (!Number.isNaN(n)) categoryId = n;
  }
  const products = await productService.findAll(categoryId);
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

export async function create(req: Request, res: Response) {
  const { name, price, stock, categoryId } = req.body;
  if (!name || typeof name !== 'string') {
    res.status(400).json({ message: 'name is required' });
    return;
  }
  if (price === undefined || price === null) {
    res.status(400).json({ message: 'price is required' });
    return;
  }
  if (stock === undefined || stock === null) {
    res.status(400).json({ message: 'stock is required' });
    return;
  }
  if (categoryId === undefined || categoryId === null) {
    res.status(400).json({ message: 'categoryId is required' });
    return;
  }
  const product = await productService.create({
    name,
    price: Number(price),
    stock: Number(stock),
    categoryId: Number(categoryId),
  });
  res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }
  const existing = await productService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  const { name, price, stock, categoryId } = req.body;
  const product = await productService.update(id, {
    ...(name !== undefined && { name }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stock !== undefined && { stock: Number(stock) }),
    ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
  });
  res.json(product);
}

export async function remove(req: Request, res: Response) {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: 'Invalid product id' });
    return;
  }
  const existing = await productService.findById(id);
  if (!existing) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  await productService.remove(id);
  res.status(204).send();
}
