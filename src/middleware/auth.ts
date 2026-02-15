/// <reference path="../types/express.d.ts" />
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }

}
