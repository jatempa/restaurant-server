import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as noteController from '../controllers/note.controller.js';

const router = Router();

router.get('/', asyncHandler(noteController.getAll));
router.get('/:id', asyncHandler(noteController.getById));

export default router;
