-- Exécuté automatiquement au premier démarrage de Postgres
-- (monté dans /docker-entrypoint-initdb.d).

CREATE TABLE IF NOT EXISTS students (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  promo TEXT NOT NULL
);

INSERT INTO students (name, promo) VALUES
  ('Alice (depuis Postgres)', 'ING1'),
  ('Bob (depuis Postgres)', 'ING1'),
  ('Charlie (depuis Postgres)', 'ING1');
