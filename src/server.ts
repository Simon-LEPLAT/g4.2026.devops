import express, { Request, Response } from 'express';
import { pool } from './db';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'TP DevOps ING1 2026 — API Docker',
    version: '1.0.0',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mock utilisé hors DB (docker run standalone, tests) ou en cas d'erreur DB.
const mockStudents = [
  { id: 1, name: 'Alice', promo: 'ING1' },
  { id: 2, name: 'Bob', promo: 'ING1' },
  { id: 3, name: 'Charlie', promo: 'ING1' },
];

app.get('/students', async (_req: Request, res: Response) => {
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT id, name, promo FROM students ORDER BY id'
      );
      res.json(result.rows);
      return;
    } catch {
      // DB indisponible → on retombe sur le mock plutôt que de planter.
    }
  }
  res.json(mockStudents);
});

app.get('/db-health', async (_req: Request, res: Response) => {
  if (!pool) {
    res.json({ db: 'disabled' });
    return;
  }
  try {
    await pool.query('SELECT 1');
    res.json({ db: 'ok' });
  } catch {
    res.status(503).json({ db: 'down' });
  }
});

// On n'écoute pas pendant les tests (Vitest force NODE_ENV=test) :
// Supertest utilise directement l'instance `app`.
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

export default app;
