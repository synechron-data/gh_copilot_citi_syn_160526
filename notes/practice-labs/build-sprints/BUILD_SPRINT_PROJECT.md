# Build Sprint Project — Task Management REST API

**Used in:** Module 6 (Build Sprint, 60 min) and Module 7 (Capstone, 45 min)
**Stack:** Node.js 20 LTS + TypeScript (strict) + Express 4 + Zod + Vitest + Pino
**Storage:** In-memory (no database for this exercise)

---

## Why this project

You need a small, realistic, well-bounded project to practise deliberate Copilot usage. A Task Management API is:

- Familiar enough that you don't waste time on domain confusion.
- Multi-file enough to exercise Agent mode.
- Tested and documented enough to fill the Capstone.
- Real-shaped enough that the workflow generalises to your actual work.

Treat the spec as a customer brief. You are the engineer. Copilot is your pair.

---

## Functional Requirements

### Resource: `Task`

A task has the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `string` (UUID v4) | Server-generated, immutable |
| `title` | `string` | 1–200 chars, required, trimmed |
| `description` | `string` | 0–2000 chars, optional |
| `status` | `"todo" \| "in_progress" \| "done"` | Required, default `"todo"` |
| `priority` | `"low" \| "medium" \| "high"` | Required, default `"medium"` |
| `createdAt` | `string` (ISO-8601) | Server-set on create, immutable |
| `updatedAt` | `string` (ISO-8601) | Server-set on create and every update |

### Endpoints

#### 1. `POST /tasks` — Create a task

**Request body:**
```json
{
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check rollback path",
  "status": "todo",
  "priority": "high"
}
```

- `title` is required. Others optional with defaults (`status: "todo"`, `priority: "medium"`, `description: ""`).
- Validate. Return 400 on invalid input.

**Response: 201 Created**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check rollback path",
  "status": "todo",
  "priority": "high",
  "createdAt": "2026-05-16T09:00:00.000Z",
  "updatedAt": "2026-05-16T09:00:00.000Z"
}
```

#### 2. `GET /tasks` — List tasks

**Query parameters (all optional):**

- `status` — filter by status (`todo` | `in_progress` | `done`)
- `priority` — filter by priority (`low` | `medium` | `high`)
- `limit` — page size (default 50, max 200)
- `offset` — pagination offset (default 0)

**Response: 200 OK**
```json
{
  "data": [ /* array of tasks */ ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

#### 3. `GET /tasks/:id` — Fetch one

**Response: 200 OK** with task body, or **404 Not Found** if missing.

#### 4. `PATCH /tasks/:id` — Update fields

**Request body** (any subset of `title`, `description`, `status`, `priority`):
```json
{
  "status": "in_progress"
}
```

- Validate that at least one field is provided.
- `updatedAt` is refreshed on every update.

**Response: 200 OK** with the updated task, or **404 Not Found**.

#### 5. `DELETE /tasks/:id` — Delete a task

**Response: 204 No Content**, or **404 Not Found** if it didn't exist.

### Error Response Shape

All non-2xx responses use this shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      { "path": "title", "message": "title must be 1-200 characters" }
    ]
  }
}
```

Codes you'll need:
- `VALIDATION_FAILED` — 400
- `NOT_FOUND` — 404
- `INTERNAL_ERROR` — 500

### Cross-cutting

- `GET /health` — returns `{ "status": "ok", "uptime": <seconds> }`.
- All responses are JSON.
- All requests/responses logged at `info` (without bodies that may contain PII for now).
- Unhandled errors logged at `error` with stack trace, return 500 + `INTERNAL_ERROR`.

---

## Architecture

Layered, with each layer's responsibility kept narrow.

```
HTTP Request
     │
     ▼
┌──────────────┐
│   Routes     │  Wires the HTTP method + path to a controller.
│ src/routes/  │  No business logic. No validation logic.
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controllers  │  Parses + validates the request (using Zod schemas),
│src/controllers/│ delegates to a service, formats the response.
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Services    │  Business logic. Coordinates one or more repositories.
│src/services/ │  Throws domain errors (e.g. NotFoundError).
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Repositories │  Data access. For this sprint: in-memory Map.
│src/repositories/│  No business logic.
└──────────────┘
```

### Folder Structure

```
task-api/
├── .github/
│   ├── copilot-instructions.md
│   └── prompts/                          (optional, for custom slash commands)
├── src/
│   ├── index.ts                          (Express bootstrap, server start)
│   ├── app.ts                            (Express app factory, middleware wiring)
│   ├── config.ts                         (env-driven config, no direct process.env elsewhere)
│   ├── routes/
│   │   ├── index.ts                      (registers all routes)
│   │   ├── health.routes.ts
│   │   └── task.routes.ts
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── services/
│   │   └── task.service.ts
│   ├── repositories/
│   │   └── task.repository.ts
│   ├── schemas/
│   │   └── task.schemas.ts               (Zod schemas for requests)
│   ├── middleware/
│   │   ├── async-handler.ts              (wraps async controllers)
│   │   ├── error-handler.ts              (global error handler)
│   │   └── request-logger.ts             (logs request/response)
│   ├── errors/
│   │   └── domain-errors.ts              (NotFoundError, ValidationError, etc.)
│   ├── lib/
│   │   └── logger.ts                     (configured Pino instance)
│   └── types/
│       └── task.ts                       (Task type, status, priority)
├── tests/
│   └── (or alongside source as *.test.ts)
├── docs/
│   └── openapi.yaml                      (generated in Module 7)
├── requests.http                         (REST Client smoke tests)
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
└── .gitignore
```

---

## Starter `.github/copilot-instructions.md`

You can use the version below as your starting point. Tune to your team's actual conventions.

```markdown
# Project Coding Standards for GitHub Copilot

## Language & Framework
- TypeScript with strict mode. No `any`. Prefer `unknown` and narrow.
- Node.js 20 LTS, Express 4.x.
- ESM imports (`import x from 'y'`), not CommonJS `require`.

## Architecture
- Layered: route → controller → service → repository.
- Controllers in `src/controllers/`. Services in `src/services/`. Repositories in `src/repositories/`.
- Controllers do not query data stores directly.
- Services contain business logic. They throw domain errors (NotFoundError, ValidationError); they never `res.send()`.
- Repositories are pure data access — no business rules.

## Validation & Errors
- Validate inputs with Zod schemas in `src/schemas/`.
- On invalid input, throw the validation error from the controller. The global error handler converts it to a 400 with structured body `{ error: { code, message, details } }`.
- Use `async/await`. Never `.then()` chains.
- Wrap async controllers with `asyncHandler` from `src/middleware/async-handler.ts`.
- Never use `try/catch` to swallow errors. Let them bubble to the global handler.

## Naming
- `camelCase` for variables and functions, `PascalCase` for types and classes.
- File names: `kebab-case.ts`. Test files: `*.test.ts` alongside source.

## Testing
- Vitest. Tests live alongside source as `*.test.ts`.
- `describe` per module, `it` per behaviour. No `should`-style.
- Mock dependencies with `vi.fn()`. Do not test the HTTP layer in unit tests.

## Logging
- Use Pino via the shared logger at `src/lib/logger.ts`.
- `info` for normal flow, `warn` for recoverable, `error` for unexpected.
- Never log secrets, tokens, full request bodies that may contain PII.

## What NOT to do
- No `console.log` in production code.
- No direct `process.env` access — use `src/config.ts`.
- No new runtime dependencies without a clear reason.
- No business logic in route files or controllers.
- No raw SQL or DB calls outside repositories.
```

---

## Starter `requests.http` (REST Client smoke tests)

Save as `requests.http` in the project root. Open in VS Code with the REST Client extension and click "Send Request" above each block.

```http
### Health check

GET http://localhost:3000/health


### Create a task

POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check the rollback path.",
  "status": "todo",
  "priority": "high"
}


### Create a minimal task (defaults applied)

POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Reply to procurement"
}


### Create — validation failure (empty title)

POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": ""
}


### List all tasks

GET http://localhost:3000/tasks


### List with filters

GET http://localhost:3000/tasks?status=todo&priority=high&limit=10


### Get one task (replace {{taskId}} with an id from the create response)

@taskId = REPLACE_ME_WITH_AN_ACTUAL_ID

GET http://localhost:3000/tasks/{{taskId}}


### Get one — not found

GET http://localhost:3000/tasks/00000000-0000-0000-0000-000000000000


### Update a task

PATCH http://localhost:3000/tasks/{{taskId}}
Content-Type: application/json

{
  "status": "in_progress"
}


### Update — validation failure (empty body)

PATCH http://localhost:3000/tasks/{{taskId}}
Content-Type: application/json

{}


### Delete a task

DELETE http://localhost:3000/tasks/{{taskId}}


### Delete — not found

DELETE http://localhost:3000/tasks/00000000-0000-0000-0000-000000000000
```

---

## Module 6 Suggested Flow

### Step 1 — Scaffold (15 min)

Open Copilot Chat in Agent mode. Use the strong prompt from the lab guide. Approve the file creations.

After scaffolding:

```bash
cd task-api
npm install
npm run dev
```

Confirm `GET http://localhost:3000/health` returns `{"status":"ok",...}`.

### Step 2 — Build the data layer first (10 min)

The repository and the type are the foundation. Build these first:

- `src/types/task.ts` — `Task`, `TaskStatus`, `TaskPriority`.
- `src/repositories/task.repository.ts` — in-memory CRUD with a `Map<string, Task>`.
- `src/errors/domain-errors.ts` — `NotFoundError`, `ValidationError`.

Prompt sketch:

```
Acting as a senior backend engineer.

TASK: Implement the in-memory TaskRepository.

CONTEXT: See spec in BUILD_SPRINT_PROJECT.md (the Task type, the list filter params).
Follow standards in .github/copilot-instructions.md.

CONSTRAINTS:
- Use a Map<string, Task> as the store.
- Generate UUIDs with the native crypto.randomUUID().
- Repository methods: create, findById, findAll (with filters + pagination), update, delete.
- Throw NotFoundError from update and delete if id is missing. Do not throw from findById — return undefined.
- Set createdAt/updatedAt internally on create and update.

OUTPUT: src/repositories/task.repository.ts only.
```

### Step 3 — Service layer (10 min)

`src/services/task.service.ts` — wraps the repository, adds any business rules. For this spec, the service is thin — but it's the right place if you later add e.g. "cannot move from done back to todo" rules.

### Step 4 — Schemas (5 min)

`src/schemas/task.schemas.ts` — Zod schemas:

- `createTaskSchema`
- `updateTaskSchema` (refines to require at least one field)
- `listTasksQuerySchema`
- `taskIdParamSchema`

### Step 5 — Controllers + routes (10 min)

`src/controllers/task.controller.ts` and `src/routes/task.routes.ts`.

Recommended Copilot move: use Agent mode for the whole controller. Prompt:

```
Read src/services/task.service.ts and src/schemas/task.schemas.ts.

Generate src/controllers/task.controller.ts following our coding standards.

Each controller method should:
1. Validate request with the corresponding Zod schema (throw on failure).
2. Call the matching service method.
3. Return the response with the right HTTP status code.

Methods: create (POST → 201), list (GET → 200), getById (GET → 200), update (PATCH → 200), remove (DELETE → 204).

Then generate src/routes/task.routes.ts that wires Express routes to the controller methods, wrapped with asyncHandler.
```

### Step 6 — Middleware (5 min)

- `src/middleware/error-handler.ts` — catches NotFoundError → 404, ZodError → 400, anything else → 500.
- `src/middleware/async-handler.ts` — the classic `(fn) => (req, res, next) => fn(req, res, next).catch(next)`.
- `src/middleware/request-logger.ts` — logs each request with `pino`.

### Step 7 — Wire it all (5 min)

In `src/app.ts`:

```typescript
import express from 'express';
import { taskRoutes } from './routes/task.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use('/health', healthRoutes);
  app.use('/tasks', taskRoutes);
  app.use(errorHandler);
  return app;
}
```

In `src/index.ts`:

```typescript
import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';

const app = createApp();
app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Task API listening');
});
```

### Step 8 — Smoke test (5 min)

Open `requests.http`. Run each request. Fix anything broken.

---

## Module 7 Suggested Flow

### Documentation (15 min)

Every public function in `src/services/` and `src/controllers/` gets JSDoc.

Approach A (one at a time): select function → `/doc with @param, @returns, @throws, @example`.

Approach B (Agent mode): one prompt for everything:

```
Add complete TSDoc comments to every exported function in:
- src/services/task.service.ts
- src/controllers/task.controller.ts
- src/repositories/task.repository.ts

For each, include: a one-sentence summary, @param entries with types and meaning,
@returns, @throws for any domain errors, and a brief @example.
Keep summary lines under 80 characters.
```

### Tests (15 min)

For the repository and the service. Skip controller tests in this sprint (would require an HTTP testing layer like supertest — out of scope).

Target structure:

```
src/repositories/task.repository.test.ts
src/services/task.service.test.ts
```

Per-test-file prompt:

```
Read src/services/task.service.ts and src/repositories/task.repository.ts.

Generate src/services/task.service.test.ts using Vitest, describe/it style.

For TaskService.create: happy path, validation rejection (let the schema test that — focus on service-level concerns).
For TaskService.findById: happy path, not-found returns undefined.
For TaskService.update: happy path, not-found throws NotFoundError, updates updatedAt.
For TaskService.remove: happy path, not-found throws NotFoundError.
For TaskService.list: returns all when no filter, applies status filter, applies priority filter, respects pagination.

Mock the repository with vi.fn(). Use beforeEach to reset mocks.
```

Run:

```bash
npm test
```

Iterate. Get to green.

### OpenAPI (10 min)

Generate `docs/openapi.yaml`:

```
Read all the route files in src/routes/, the controllers in
src/controllers/, and the schemas in src/schemas/.

Generate a complete OpenAPI 3.1 YAML specification.

Required:
- Info section with title "Task API", version 1.0.0.
- All paths: /health, POST /tasks, GET /tasks, GET /tasks/{id},
  PATCH /tasks/{id}, DELETE /tasks/{id}.
- Components/schemas for Task, CreateTaskRequest, UpdateTaskRequest,
  ListTasksResponse, ErrorResponse.
- Each operation has: summary, description, tags, parameters,
  requestBody (where relevant), responses (200/201/204 happy + 400/404 error).
- One concrete example for each requestBody and one for each response body.

Write to docs/openapi.yaml.
```

Validate the YAML at https://editor.swagger.io (paste; check for errors).

### Debrief (5 min)

Three lines, ready for the trainer to ask:

1. Where Copilot helped most: ______
2. Where Copilot fell short: ______
3. The prompting habit I'll carry to Monday: ______

---

## Bonus / Stretch Goals (if you finish early)

Pick one or more. Use Copilot Chat to scaffold:

- **Auth middleware** — a stub JWT verification middleware. (Don't build the auth issuer; just verify a static dev token for now.)
- **Rate limiting** — using a custom slash command or Agent mode, add a simple per-IP rate limiter.
- **Switch storage to SQLite** — replace `TaskRepository` with a real DB-backed version. Bonus points if you don't touch any other file.
- **Containerise** — generate a `Dockerfile` and a `docker-compose.yml` that runs the API.
- **A second resource** — add `POST /tags`, `GET /tags`, allow tagging tasks. Test the limits of `.github/copilot-instructions.md` — does Copilot match the patterns from `tasks` automatically?

---

**End of Build Sprint Specification.**
