# Project Coding Standards for GitHub Copilot

## Language & Framework
- TypeScript with strict mode. No `any`. Prefer `unknown` and narrow.
- Node.js 20 LTS, Express 4.x.
- ESM imports (`import x from 'y'`), not CommonJS `require`.

## Architecture
- Layered: route -> controller -> service -> repository.
- Controllers in `src/controllers/`. Services in `src/services/`. Repositories in `src/repositories/`.
- Controllers do not query data stores directly.
- Services contain business logic. They throw domain errors (NotFoundError, ValidationError); they never `res.send()`.
- Repositories are pure data access -- no business rules.

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
- No direct `process.env` access -- use `src/config.ts`.
- No new runtime dependencies without a clear reason.
- No business logic in route files or controllers.
- No raw SQL or DB calls outside repositories.
