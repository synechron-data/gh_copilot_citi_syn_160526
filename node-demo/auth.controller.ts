// Demo state: password hashing logic is inlined into this controller.
// During Module 4.5 (Agent Mode demo), Copilot is asked to extract this
// into src/services/password-service.ts, update imports, and add a unit test.
// Do NOT pre-refactor this file before the session.

import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { logger } from '../lib/logger.js';

type AuthRequestBody = {
  email?: string;
  password?: string;
};

type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
};

// In-memory user store for the demo. Keyed by email.
const users = new Map<string, AuthUser>();

const readCredentials = (req: Request): AuthRequestBody => req.body as AuthRequestBody;

const hasCredentials = (
  credentials: AuthRequestBody,
): credentials is { email: string; password: string } =>
  typeof credentials.email === 'string' && typeof credentials.password === 'string';

export const authController = {
  register: async (req: Request, res: Response) => {
    const credentials = readCredentials(req);

    if (!hasCredentials(credentials)) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { email, password } = credentials;

    if (users.has(email)) {
      return res.status(409).json({ error: 'email already registered' });
    }

    // Inline password hashing — extract me into a password service
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const id = crypto.randomUUID();
    users.set(email, { id, email, passwordHash });

    logger.info({ email }, 'User registered');
    return res.status(201).json({ id, email });
  },

  login: async (req: Request, res: Response) => {
    const credentials = readCredentials(req);

    if (!hasCredentials(credentials)) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { email, password } = credentials;

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // Inline password verification — extract me into a password service
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logger.warn({ email }, 'Login failed: bad password');
      return res.status(401).json({ error: 'invalid credentials' });
    }

    logger.info({ email }, 'User logged in');
    return res.status(200).json({ id: user.id, email: user.email });
  },
};
