import bcrypt from 'bcrypt';
import * as userService from './user.service.js';
import { signToken } from '../lib/jwt.js';

export interface AuthResult {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    firstLastName: string;
  };
}

export type RegisterError = 'EMAIL_EXISTS' | 'USERNAME_EXISTS';

export async function register(data: userService.CreateUserData): Promise<AuthResult | RegisterError> {
  const existingByEmail = await userService.findByEmail(data.email);
  if (existingByEmail) return 'EMAIL_EXISTS';

  const existingByUsername = await userService.findByUsername(data.username);
  if (existingByUsername) return 'USERNAME_EXISTS';

  const user = await userService.create(data);

  const token = signToken({
    sub: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      firstLastName: user.firstLastName,
    },
  };
}

export async function login(identifier: string, password: string): Promise<AuthResult | null> {
  const user = await userService.findByEmailOrUsername(identifier);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  await userService.updateLastLogin(user.id);

  const token = signToken({
    sub: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      firstLastName: user.firstLastName,
    },
  };
}
