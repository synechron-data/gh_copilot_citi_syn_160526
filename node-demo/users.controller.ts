import type { RequestHandler } from 'express';

type CreateUserBody = {
  email?: string;
  name?: string;
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const usersByEmail = new Map<string, UserRecord>();

/**
 * Express route handler for creating a user.
 *
 * @param req - Express request containing { email, name } in the body.
 * @param res - Express response that returns 201 with the created user.
 * @returns JSON response with the created user, or a validation/conflict error.
 * @throws Never throws directly; responds with HTTP errors for invalid input.
 *
 * @example
 * app.post('/users', createUser);
 */
export const createUser: RequestHandler<unknown, { user: UserRecord } | { error: string }, CreateUserBody> = (
  req,
  res
) => {
  const email = req.body.email?.trim().toLowerCase();
  const name = req.body.name?.trim();

  if (!email || !name) {
    return res.status(400).json({ error: 'email and name are required' });
  }

  if (usersByEmail.has(email)) {
    return res.status(409).json({ error: 'user already exists' });
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(email, user);

  return res.status(201).json({ user });
};
