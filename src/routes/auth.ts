import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', asyncHandler(authController.signUp));
router.post('/login', asyncHandler(authController.signIn));
router.post('/logout', asyncHandler(authController.signOut));

export default router;
