import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

router.get('/', asyncHandler(categoryController.getAll));
router.get('/:id', asyncHandler(categoryController.getById));

export default router;
