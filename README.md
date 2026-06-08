# TP DevOps ING1 — Docker, Compose & CI/CD

Repo unique servant les TP du cours DevOps. Une même API Node/TypeScript est
conteneurisée (Jour 1), orchestrée avec Compose (Jour 2 — TP1), puis automatisée
via un pipeline GitHub Actions (Jour 2 — TP2).

## L'application

API Express en TypeScript :

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/` | Message d'accueil |
| `GET` | `/health` | Healthcheck process (status + uptime) |
| `GET` | `/students` | Liste de promo — lue depuis Postgres, **fallback mock** sans DB |
| `GET` | `/db-health` | État DB : `ok` / `down` / `disabled` (si pas de `DATABASE_URL`) |

> La base est **optionnelle** : sans `DATABASE_URL`, l'app tourne en mode mock
> (utile pour le `docker run` standalone du Jour 1 et pour les tests).

## Lancer en local (sans Docker)

```bash
npm install
npm run build && npm start    # http://localhost:3000
npm run dev                   # mode hot-reload

npm run lint                  # ESLint
npm test                      # Vitest
```

---

## Jour 1 — Conteneurisation Docker

Écris ton propre `Dockerfile` (naïf d'abord), build, run, puis optimise
(multi-stage, `.dockerignore`, alpine) pour réduire la taille.

```bash
docker build -t mon-api:v1 .
docker run -d -p 3000:3000 --name mon-api mon-api:v1
curl http://localhost:3000/health
docker images mon-api
```

Le `Dockerfile` fourni à la racine est la **version optimisée de référence**
(multi-stage alpine + user non-root + healthcheck + cache mounts BuildKit,
~150-180 Mo). La progression pédagogique complète (v1 naïf → v4 production) est
dans `../instructor-solutions/`.

---

## Jour 2 — TP1 : stack Docker Compose

Orchestre **nginx (reverse proxy) → api → Postgres**.

1. Copie `.env.example` en `.env`.
2. Complète les `# TODO` de `docker-compose.yml` (ports nginx, `DATABASE_URL`,
   `depends_on`/healthcheck, volume nommé).
3. Lance et teste via nginx (port 80) :

```bash
docker compose up -d --build
curl http://localhost/students      # données issues de Postgres
curl http://localhost/db-health     # { "db": "ok" }
docker compose down
```

**Bonus** : healthcheck `pg_isready` + `depends_on: condition: service_healthy`,
volume nommé pour persister la DB.

---

## Jour 2 — TP2 : pipeline CI/CD GitHub Actions

Complète `.github/workflows/ci.yml` : à chaque push sur `main`,
**lint → test → build** d'une image Docker.

- **Cible obligatoire** : jusqu'au build (`push: false`) — marche sans credentials.
- **Bonus** : push de l'image vers `ghcr.io` (étape 4), deploy simulé (étape 5).

Le job `build` utilise le `Dockerfile` racine (`context: .`). Solution complète
des 5 étapes : `solutions/ci.yml`.

### Pour les rapides (une fois le build vert)

Au choix, dans l'ordre que tu veux :

1. **Gating** — casse un test (change une assertion), pousse : le job `build` ne
   démarre pas (`needs: test`). Répare et observe la reprise.
2. **Cache** — relance le workflow 2 fois et compare la durée du `build` :
   1er run (cache froid) vs 2e (`cache-from: type=gha`).
3. **Push GHCR** _(bonus 4)_ — `push: true` + `permissions: packages: write` +
   `docker/login-action` → l'image apparaît dans l'onglet *Packages* du repo.
4. **Parallélisation** — fais tourner `lint` et `test` en parallèle (`build` avec
   `needs: [lint, test]`) et observe le gain sur le graphe des jobs.
5. **Deploy simulé** _(bonus 5)_ — ajoute le job `deploy` avec
   `environment: production` et observe le passage d'approbation manuelle.
6. **Trigger tag** — déclenche aussi sur push de tag `v*` et tague l'image avec
   le nom du tag (`${{ github.ref_name }}`).

---

## Commandes Docker utiles

```bash
docker ps -a                 # conteneurs (même arrêtés)
docker logs -f mon-api       # logs
docker exec -it mon-api sh   # shell dans le conteneur
docker stop mon-api && docker rm mon-api
docker container prune       # ménage
```
