import bcrypt from 'bcrypt';
import { prisma } from '../lib/db.js';

const DEFAULT_SIGNUP_ROLE = 'ROLE_USER';
const ALLOWED_SIGNUP_ROLES = new Set(['ROLE_USER', 'ROLE_ADMIN']);

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  name: string;
  firstLastName: string;
  secondLastName?: string;
  cellphoneNumber: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN';
}

/**
 * Create a new user with hashed password.
 */
export async function create(data: CreateUserData) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const normalizedRole = (data.role ?? DEFAULT_SIGNUP_ROLE).trim().toUpperCase();
  const role = ALLOWED_SIGNUP_ROLES.has(normalizedRole) ? normalizedRole : DEFAULT_SIGNUP_ROLE;
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      password: hashedPassword,
      name: data.name.trim(),
      firstLastName: data.firstLastName.trim(),
      secondLastName: data.secondLastName?.trim() ?? null,
      cellphoneNumber: data.cellphoneNumber.trim(),
      userRoles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: role },
              create: { name: role },
            },
          },
        },
      },
    },
  });
}

/**
 * Find user by email (for login or registration check).
 */
export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

/**
 * Find user by username (for login or registration check).
 */
export async function findByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase().trim() },
  });
}

/**
 * Find user by email or username for login.
 */
export async function findByEmailOrUsername(identifier: string) {
  const normalized = identifier.toLowerCase().trim();
  return prisma.user.findFirst({
    where: {
      enabled: true,
      OR: [{ email: normalized }, { username: normalized }],
    },
  });
}

/**
 * Update last login timestamp.
 */
export async function updateLastLogin(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
}
