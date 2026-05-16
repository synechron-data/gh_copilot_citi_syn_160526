# copilot-demo-node

A Node.js / TypeScript demo project used for **Synechron GitHub Copilot training** sessions. Each source file is purposely kept in a specific "demo state" to illustrate different Copilot features live.

---

## Project Structure

```
node-demo/
├── array-utils.ts        # Array helper utilities (contains a deliberate bug for the /fix demo)
├── auth.controller.ts    # Express auth controller with inline password hashing (refactoring demo)
├── price-calculator.ts   # Empty file used for comment-driven development demo
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 20 |
| Language | TypeScript 5 |
| Web Framework | Express 4 |
| Password Hashing | bcrypt |
| Logging | pino |
| Testing | Vitest |
| Dev Runner | tsx (watch mode) |

---

## Getting Started

### Prerequisites

- Node.js **20+**
- npm

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Start (production build)

```bash
npm start
```

### Type-check

```bash
npm run typecheck
```

### Run tests

```bash
npm test
```

---

## Module Demo Guide

### Module 2 — `/fix` Slash Command (`array-utils.ts`)

`findLastEven` contains a deliberate bug: it returns the **first** even number instead of the last. Use this file to demonstrate Copilot's `/fix` command.

```ts
// Bug: iterates forward and returns on first match
export function findLastEven(numbers: number[]): number | undefined { ... }
```

Additional utility functions (`head`, `last`, `chunk`) are correct and serve as reference examples.

---

### Module 3.2 — Comment-Driven Development (`price-calculator.ts`)

The file is intentionally empty. During the demo, build it up in three progressive styles:

- **Style A** — one-line comment (`// Calculate VAT`)
- **Style B** — full JSDoc spec with `@param`, `@returns`, and edge cases
- **Style C** — spec + function scaffold with inline step comments

---

### Module 4.5 — Agent Mode Refactoring (`auth.controller.ts`)

The controller has password hashing logic inlined directly. Use Agent Mode to:

1. Extract hashing/verification into `src/services/password-service.ts`
2. Update imports in the controller
3. Generate a unit test for the new service

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login with email and password |

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `201`**
```json
{ "id": "<uuid>", "email": "user@example.com" }
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{ "id": "<uuid>", "email": "user@example.com" }
```

---

## Notes

- The in-memory user store resets on every server restart — no persistence is intended.
- Demo state comments at the top of each file describe what **not** to change before a session.
