/**
 * Test suite for POST /users (createUser handler)
 *
 * Strategy:
 *  - A minimal Express app is built fresh in each beforeEach by re-importing
 *    the handler after vi.resetModules(). This clears the module-level
 *    usersByEmail Map, giving every test a clean slate.
 *  - crypto.randomUUID and Date are stubbed for deterministic assertions.
 *  - Supertest drives real HTTP through the Express stack so middleware,
 *    status codes, and JSON serialisation are all exercised end-to-end.
 */

import express, { type Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── Constants used across tests ─────────────────────────────────────────────
const FIXED_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const FIXED_ISO = '2026-05-16T00:00:00.000Z';

// ── App factory ─────────────────────────────────────────────────────────────

/**
 * Creates a fresh Express app mounting the createUser handler at POST /users.
 * Called after vi.resetModules() so the in-memory store is always empty.
 */
async function buildApp(): Promise<Express> {
  const { createUser } = await import('./users.controller.js');
  const app = express();
  app.use(express.json());
  app.post('/users', createUser);
  return app;
}

// ── Suite ────────────────────────────────────────────────────────────────────

describe('POST /users', () => {
  let app: Express;

  beforeEach(async () => {
    // Reset module registry → fresh usersByEmail Map on each test
    vi.resetModules();

    // Stub globals before the module is re-imported
    vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValue(FIXED_UUID) });
    vi.stubGlobal(
      'Date',
      class {
        toISOString() {
          return FIXED_ISO;
        }
      },
    );

    app = await buildApp();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Happy Path ─────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    it('should return 201 with the created user for valid input', async () => {
      // Arrange
      const body = { email: 'alice@example.com', name: 'Alice' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user: {
          id: FIXED_UUID,
          email: 'alice@example.com',
          name: 'Alice',
          createdAt: FIXED_ISO,
        },
      });
    });

    it('should return a response body with the correct structure', async () => {
      // Arrange
      const body = { email: 'bob@example.com', name: 'Bob' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert — structural shape check
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('createdAt');
    });

    it('should assign a UUID as the user id', async () => {
      // Arrange
      const body = { email: 'carol@example.com', name: 'Carol' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.body.user.id).toBe(FIXED_UUID);
    });

    it('should set createdAt to an ISO timestamp', async () => {
      // Arrange
      const body = { email: 'dave@example.com', name: 'Dave' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.body.user.createdAt).toBe(FIXED_ISO);
    });

    it('should allow two different users to register independently', async () => {
      // Act
      const r1 = await request(app).post('/users').send({ email: 'alice@example.com', name: 'Alice' });
      const r2 = await request(app).post('/users').send({ email: 'bob@example.com', name: 'Bob' });

      // Assert
      expect(r1.status).toBe(201);
      expect(r2.status).toBe(201);
    });
  });

  // ── Input Validation (400) ─────────────────────────────────────────────────

  describe('Input Validation', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      const body = { name: 'Alice' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should return 400 when name is missing', async () => {
      // Arrange
      const body = { email: 'alice@example.com' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should return 400 when both email and name are missing', async () => {
      // Arrange — empty body
      const body = {};

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should return 400 when email is an empty string', async () => {
      // Arrange
      const body = { email: '', name: 'Alice' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should return 400 when name is an empty string', async () => {
      // Arrange
      const body = { email: 'alice@example.com', name: '' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should return 400 when email is whitespace only', async () => {
      // Whitespace-only email trims to empty string → fails validation
      const body = { email: '   ', name: 'Alice' };

      const response = await request(app).post('/users').send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should return 400 when name is whitespace only', async () => {
      // Whitespace-only name trims to empty string → fails validation
      const body = { email: 'alice@example.com', name: '   ' };

      const response = await request(app).post('/users').send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'email and name are required' });
    });

    it('should normalise email to lowercase before storing', async () => {
      // Email with mixed case should be stored in lowercase
      const body = { email: 'ALICE@EXAMPLE.COM', name: 'Alice' };

      const response = await request(app).post('/users').send(body);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('alice@example.com');
    });

    it('should trim leading and trailing whitespace from email', async () => {
      // Email with surrounding spaces should be stored without them
      const body = { email: '  alice@example.com  ', name: 'Alice' };

      const response = await request(app).post('/users').send(body);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('alice@example.com');
    });

    it('should trim leading and trailing whitespace from name', async () => {
      // Name with surrounding spaces should be stored without them
      const body = { email: 'alice@example.com', name: '  Alice  ' };

      const response = await request(app).post('/users').send(body);

      expect(response.status).toBe(201);
      expect(response.body.user.name).toBe('Alice');
    });
  });

  // ── Data Sanitisation / Transformation ────────────────────────────────────

  describe('Data Sanitisation', () => {
    it('should store the normalised email (lowercase + trimmed) in the response', async () => {
      // Arrange — email with mixed case and surrounding spaces
      const body = { email: '  Alice@Example.COM  ', name: 'Alice' };

      // Act
      const response = await request(app).post('/users').send(body);

      // Assert — both transformations applied
      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('alice@example.com');
    });
  });

  // ── Conflict (409) ─────────────────────────────────────────────────────────

  describe('Conflict Detection', () => {
    it('should return 409 when a user with the same email already exists', async () => {
      // Arrange — seed the first user
      await request(app).post('/users').send({ email: 'alice@example.com', name: 'Alice' });

      // Act — attempt to register again with the same email
      const response = await request(app)
        .post('/users')
        .send({ email: 'alice@example.com', name: 'Alice Duplicate' });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'user already exists' });
    });

    it('should treat duplicate detection as case-insensitive', async () => {
      // Arrange — seed with lowercase email
      await request(app).post('/users').send({ email: 'alice@example.com', name: 'Alice' });

      // Act — attempt with uppercase variant (normalises to the same key)
      const response = await request(app)
        .post('/users')
        .send({ email: 'ALICE@EXAMPLE.COM', name: 'Alice Upper' });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: 'user already exists' });
    });

    it('should not affect registration of a different email after a conflict', async () => {
      // Arrange — seed alice
      await request(app).post('/users').send({ email: 'alice@example.com', name: 'Alice' });
      // Trigger conflict
      await request(app).post('/users').send({ email: 'alice@example.com', name: 'Alice 2' });

      // Act — register a completely different user
      const response = await request(app)
        .post('/users')
        .send({ email: 'bob@example.com', name: 'Bob' });

      // Assert — bob should succeed despite alice's conflict
      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('bob@example.com');
    });
  });
});
