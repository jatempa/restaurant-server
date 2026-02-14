import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

router.get('/', asyncHandler(productController.getAll));
router.get('/:id', asyncHandler(productController.getById));
router.post('/', asyncHandler(productController.create));
router.put('/:id', asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));

export default router;
