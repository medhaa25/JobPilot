# JobPilot

Personal job-search platform: discover jobs, save them, track applications, view analytics.

```
jobpilot/
├── frontend/   React + Vite + TypeScript + Tailwind v4
├── backend/    Node + Express + TypeScript + PostgreSQL
└── docker-compose.yml   (local PostgreSQL)
```

## Run

```bash
# database (optional until backend work starts)
docker compose up -d

# backend  -> http://localhost:4000
cd backend && cp .env.example .env && npm install && npm run dev

# frontend -> http://localhost:5173
cd frontend && npm install && npm run dev
```

The API lives under `/api/v1`; all routes are stubbed (501) in `backend/src/routes/index.ts`.
The database schema is in `backend/src/db/schema.sql`.

## Frontend: mock mode

`frontend/.env.local` has `VITE_USE_MOCK=true`, so every feature runs on in-memory data (see each
`features/*/api/*.mock.ts` and `src/lib/mockDb.ts`) with no backend. When the API is ready, set it to
`false`; the real Axios calls in `features/*/api/*Api.ts` are already written against the endpoints in the plan.
