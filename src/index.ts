import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store for testing
interface Item {
  id: number;
  name: string;
  description: string;
}

let items: Item[] = [
  { id: 1, name: 'Item 1', description: 'First test item' },
  { id: 2, name: 'Item 2', description: 'Second test item' },
];

let nextId = 3;

// GET all items
app.get('/api/items', (_req: Request, res: Response) => {
  res.json(items);
});

// GET single item by id
app.get('/api/items/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? parseInt(idParam) : NaN;
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json(item);
});

// POST create new item
app.post('/api/items', (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: 'Name and description are required' });
  }

  const newItem: Item = { id: nextId++, name, description };
  items.push(newItem);

  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/items/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? parseInt(idParam) : NaN;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }

  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: 'Name and description are required' });
  }

  // Ensure the updated object includes the required 'id' property (to satisfy Item type)
  items[index] = { id: items[index]!.id, name, description };

  res.json(items[index]);
});

// DELETE item
app.delete('/api/items/:id', (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = typeof idParam === 'string' ? parseInt(idParam) : NaN;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid item id' });
  }

  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const deleted = items.splice(index, 1);

  res.json({ message: 'Item deleted', item: deleted[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
