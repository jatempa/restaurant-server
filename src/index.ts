import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// User fields exposed in API (excludes password, username, etc.)
const userSelect = {
  id: true,
  email: true,
  name: true,
  firstLastName: true,
} as const;

// Parse id param helper
function parseId(idParam: string | string[] | undefined): number | null {
  const str = typeof idParam === 'string' ? idParam : undefined;
  if (!str) return null;
  const id = parseInt(str, 10);
  return Number.isNaN(id) ? null : id;
}

// ─── Accounts ─────────────────────────────────────────────────────────────
app.get('/api/accounts', async (_req: Request, res: Response) => {
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

app.get('/api/accounts/:id', async (req: Request, res: Response) => {
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

// ─── Categories ────────────────────────────────────────────────────────────
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true },
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Invalid category id' });

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// ─── Products ──────────────────────────────────────────────────────────────
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ message: 'Invalid product id' });

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// ─── Notes (with products) ──────────────────────────────────────────────────
app.get('/api/notes', async (_req: Request, res: Response) => {
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

app.get('/api/notes/:id', async (req: Request, res: Response) => {
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

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  server.close();
  await prisma.$disconnect();
});
