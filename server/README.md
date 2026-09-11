# Todo Productivity — Backend (Phase 1)

Express + TypeScript + MongoDB API for the productivity to-do assignment.
This is the backend only — the React Native app is a later phase.

## Status

- TypeScript compiles clean in strict mode (`npm run build` / `npx tsc --noEmit`).
- Unit tests pass: **26 passed** covering the urgency engine, task
  validators, and auth validators — all pure logic, no database required.
- Integration tests (`tests/integration/*.test.ts`) exercise the real HTTP
  API — register/login, task CRUD, ownership isolation between users,
  insights — but **have not been run against a live database**. They need
  a real MongoDB, and the sandbox this was built in has no network path
  to one (no local `mongod`, no Docker, and the egress proxy blocks
  MongoDB's own download host). They're written to run for real the
  moment you point `MONGODB_URI` at an actual MongoDB — see below.

## Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGODB_URI to a real MongoDB (local or Atlas) and a JWT_SECRET
npm run dev
```

Health check once running: `GET http://localhost:8000/api/health`

## Running the tests for real

Unit tests need nothing extra:

```bash
npm run test:unit
```

Integration tests need a MongoDB you control. Two easy options:

**Option A — local MongoDB**, if you have one installed:
```bash
MONGODB_URI="mongodb://127.0.0.1:27017/todo-productivity-test" npm run test:integration
```

**Option B — `mongodb-memory-server`**, an in-process MongoDB for tests
that downloads its own binary on first run (needs internet, which your
machine has and this sandbox didn't):
```bash
npm install --save-dev mongodb-memory-server
```
then in `tests/integration/setup.ts`, swap the manual `MONGODB_URI` check
for spinning up `MongoMemoryServer.create()` in a `beforeAll` and using
its `getUri()` — a few lines, deliberately left out here rather than
added blind, since it couldn't be exercised in this environment either.

Once `MONGODB_URI` is set, `npm test` runs all 39 tests (26 unit + 13
integration) instead of skipping the integration suite.

## What's implemented

- **Auth**: register (name/email/password/confirm), login, bcrypt password
  hashing, JWT issuance, passwords never serialized in any response.
- **Tasks**: full CRUD + mark-complete, all scoped to the authenticated
  user. Accessing, editing, or deleting another user's task by ID returns
  `404` (not `403`) so a caller can't distinguish "not yours" from
  "doesn't exist" by probing IDs.
- **Smart urgency engine** (`src/services/urgencyEngine.ts`):
  `calculateTaskUrgency(task)` returns a deterministic `{ score, label,
  reason }` from priority + deadline proximity + overdue state — no AI
  call, same inputs always produce the same output, every weight is
  explained in a comment. `sortTasksByUrgency(tasks)` uses it to rank a
  task list, with completed tasks always sorted after active ones and
  ties broken by creation time.
- **List sorting modes**: `GET /api/tasks?sort=smart|deadline|priority|newest|completed`.
- **Insights**: `GET /api/tasks/insights` — total/completed/pending/overdue
  counts, completion rate, today's activity, average completion time (only
  computed from tasks that actually have both a `createdAt` and
  `completedAt`; returns `null` + `hasEnoughDataForAverage: false` rather
  than a fabricated number when there's no data yet).
- **Centralized error handling**: every error funnels through one
  middleware; unexpected errors are logged server-side and returned to
  the client as a generic 500, never leaking internals.
- **Validation**: pure, unit-tested validator functions for both auth and
  task payloads, used by the controllers before touching the database.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register (name, email, password, confirmPassword) |
| POST | `/api/auth/login` | No | Login (email, password) → `{ user, token }` |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks?sort=` | Yes | List the caller's tasks |
| GET | `/api/tasks/:id` | Yes | Get one task (404 if not yours) |
| PUT | `/api/tasks/:id` | Yes | Partial update |
| PATCH | `/api/tasks/:id/complete` | Yes | Mark complete, sets `completedAt` |
| DELETE | `/api/tasks/:id` | Yes | Delete |
| GET | `/api/tasks/insights` | Yes | Aggregate stats |

All authenticated routes expect `Authorization: Bearer <token>`.

## Response shape

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "..." }
```

## Project structure

```
server/
├── src/
│   ├── config/       env loading, MongoDB connection
│   ├── models/        User, Task (Mongoose schemas)
│   ├── middleware/    JWT auth guard, centralized error handler
│   ├── controllers/   auth + task route handlers
│   ├── routes/        Express routers
│   ├── services/      urgencyEngine.ts — the scoring/sorting logic
│   ├── validators/     pure request-payload validation
│   ├── utils/          ApiError, ApiResponse, asyncHandler
│   ├── app.ts          Express app assembly (imported by tests, no port bind)
│   └── server.ts       entrypoint: connect DB, then listen
├── tests/
│   ├── unit/           no DB needed — urgency engine, validators
│   └── integration/    real HTTP + DB — needs MONGODB_URI, see above
├── .env.example
└── package.json
```

## Next phases

Per the assignment's phased plan: Phase 3 (React Native app) and beyond
are not part of this delivery — this stops at a working, tested backend
as requested.
