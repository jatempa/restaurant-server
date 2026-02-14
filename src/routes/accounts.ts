import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as accountController from '../controllers/account.controller.js';

const router = Router();

router.get('/', asyncHandler(accountController.getAll));
router.get('/:id', asyncHandler(accountController.getById));
router.post('/', asyncHandler(accountController.create));
router.put('/:id', asyncHandler(accountController.update));
router.delete('/:id', asyncHandler(accountController.remove));

export default router;
