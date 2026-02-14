import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

router.get('/', asyncHandler(categoryController.getAll));
router.get('/:id', asyncHandler(categoryController.getById));
router.post('/', asyncHandler(categoryController.create));
router.put('/:id', asyncHandler(categoryController.update));
router.delete('/:id', asyncHandler(categoryController.remove));

export default router;
