import express from 'express';
import { getMemories, createMemory, updateMemory, reorderMemories, deleteMemory } from '../controllers/memory.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest, memorySchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getMemories);
router.post('/', validateRequest(memorySchema), createMemory);
router.post('/reorder', reorderMemories);
router.patch('/:id', updateMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
