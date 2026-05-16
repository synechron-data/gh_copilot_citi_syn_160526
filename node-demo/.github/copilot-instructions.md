# Project Coding Standards for GitHub Copilot

These instructions are read by GitHub Copilot whenever it generates code in this repository. They define how this team writes code, so Copilot's output matches our conventions by default.

## Language & Framework

- TypeScript with strict mode. No `any`. Prefer `unknown` and narrow.
- Node.js 20 LTS, Express 4.x.
- ESM imports (`import x from 'y'`). Never CommonJS `require`.
- Native `crypto` for UUIDs (`crypto.randomUUID()`). Not the `uuid` npm package.

## Architecture

- Layered: route → controller → service → repository.
- Controllers parse + validate requests, call services, format responses. No business logic.
- Services hold business logic. Throw domain errors. Never touch `res`.
- Repositories are pure data access — no business rules.
- Each layer depends only on the one directly below it.

## Validation & Errors

- Validate request inputs with Zod schemas in `src/schemas/`.
- On invalid input, the schema throws. A global error handler converts to 400 with:
  `{ error: { code, message, details } }`.
- Use `async/await`. Never `.then()` chains.
- Wrap async controllers with `asyncHandler` middleware.
- Do not use `try/catch` to swallow errors. Let them bubble.

## Naming

- `camelCase` for variables and functions.
- `PascalCase` for types, interfaces, classes.
- File names: `kebab-case.ts`. Test files: `*.test.ts` alongside source.

## Testing

- **Vitest**. Not Jest, not Mocha.
- Tests live alongside source as `*.test.ts` — not in a separate `tests/` directory.
- `describe(ModuleName)` per module, `it(behaviour)` per behaviour. No `should`-style.
- Mock dependencies with `vi.fn()`. Reset in `beforeEach`.

## Logging

- Use **Pino** via the shared logger at `src/lib/logger.ts`. Import as `import { logger } from '../lib/logger.js'`.
- `logger.info` — normal flow. Include a structured object first, message second:
  `logger.info({ userId, taskId }, 'Task updated');`
- `logger.warn` — recoverable issues.
- `logger.error` — unexpected failures with the error included.
- **Never log** secrets, tokens, passwords, full request bodies with PII.

## What NOT to Do

- No `console.log`, `console.error` in production code. Use the logger.
- No direct `process.env` access outside config modules.
- No business logic in route files or controllers.
- No raw SQL or DB calls outside repositories.
- No `as any` casts. If you need `any`, file a TODO and refactor.

## Documentation

- All exported functions and classes have JSDoc.
- Include `@param`, `@returns`, and `@throws` for documented errors.
- Public service/controller methods should include an `@example` block.

## Git

- Commit messages: `type(scope): subject`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.
