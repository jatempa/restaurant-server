import express from 'express';
import cors from 'cors';
import { prisma } from './lib/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import accountsRoutes from './routes/accounts.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import notesRoutes from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (auth is public)
app.use('/api/auth', authRoutes);

// Protected routes - require valid JWT
app.use('/api/accounts', authenticate, accountsRoutes);
app.use('/api/categories', authenticate, categoriesRoutes);
app.use('/api/products', authenticate, productsRoutes);
app.use('/api/notes', authenticate, notesRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  server.close();
  await prisma.$disconnect();
});
