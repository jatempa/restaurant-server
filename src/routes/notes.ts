import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as noteController from '../controllers/note.controller.js';

const router = Router();

router.get('/', asyncHandler(noteController.getAll));
router.get('/:id', asyncHandler(noteController.getById));
router.post('/', asyncHandler(noteController.create));
router.put('/:id', asyncHandler(noteController.update));
router.delete('/:id', asyncHandler(noteController.remove));

export default router;
