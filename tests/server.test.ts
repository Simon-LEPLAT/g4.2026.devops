import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('API endpoints', () => {
  it('GET /health → 200 status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /students → 200 + tableau non vide', async () => {
    const res = await request(app).get('/students');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('GET /db-health → db disabled hors DATABASE_URL', async () => {
    const res = await request(app).get('/db-health');
    expect(res.status).toBe(200);
    expect(res.body.db).toBe('disabled');
  });
});
