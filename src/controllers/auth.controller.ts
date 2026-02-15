import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

const ALLOWED_SIGNUP_ROLES = new Set(['ROLE_USER', 'ROLE_ADMIN']);

export async function signUp(req: Request, res: Response) {
  const { email, username, password, name, firstLastName, secondLastName, cellphoneNumber, role } =
    req.body;

  const required = ['email', 'username', 'password', 'name', 'firstLastName', 'cellphoneNumber'];
  const missing = required.filter((key) => req.body[key] == null || req.body[key] === '');
  if (missing.length > 0) {
    res.status(400).json({
      message: `Missing required fields: ${missing.join(', ')}`,
    });
    return;
  }

  const normalizedRole =
    role == null || role === '' ? undefined : String(role).trim().toUpperCase();

  if (normalizedRole && !ALLOWED_SIGNUP_ROLES.has(normalizedRole)) {
    res.status(400).json({ message: 'Invalid role. Allowed values: ROLE_USER, ROLE_ADMIN' });
    return;
  }

  const result = await authService.register({
    email: String(email),
    username: String(username),
    password: String(password),
    name: String(name),
    firstLastName: String(firstLastName),
    ...(secondLastName != null && secondLastName !== '' && { secondLastName: String(secondLastName) }),
    cellphoneNumber: String(cellphoneNumber),
    ...(normalizedRole && { role: normalizedRole as 'ROLE_USER' | 'ROLE_ADMIN' }),
  });

  if (result === 'EMAIL_EXISTS') {
    res.status(409).json({ message: 'Email already registered' });
    return;
  }
  if (result === 'USERNAME_EXISTS') {
    res.status(409).json({ message: 'Username already taken' });
    return;
  }

  res.status(201).json(result);
}

export async function signIn(req: Request, res: Response) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ message: 'identifier and password are required' });
    return;
  }

  const result = await authService.login(String(identifier), String(password));

  if (!result) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json(result);
}

export async function signOut(_req: Request, res: Response) {
  // JWT is stateless; client discards token on logout.
  // If using refresh tokens or blacklist, handle here.
  res.status(204).send();
}
