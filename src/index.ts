import express from 'express';
import cors from 'cors';
import { prisma } from './lib/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import accountsRoutes from './routes/accounts.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import notesRoutes from './routes/notes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/notes', notesRoutes);

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
