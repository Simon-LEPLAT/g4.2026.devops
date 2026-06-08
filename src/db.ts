import { Pool } from 'pg';

// Pool paresseux : créé uniquement si DATABASE_URL est défini.
// Sans DB (ex: docker run standalone, tests), l'app fonctionne en mode mock.
const connectionString = process.env.DATABASE_URL;

export const pool: Pool | null = connectionString
  ? new Pool({ connectionString })
  : null;

export const dbEnabled = pool !== null;
