import express from 'express';
import { getDuas, createDua, updateDua, reorderDuas, deleteDua } from '../controllers/dua.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest, duaCardSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getDuas);
router.post('/', validateRequest(duaCardSchema), createDua);
router.post('/reorder', reorderDuas);
router.patch('/:id', updateDua);
router.put('/:id', updateDua);
router.delete('/:id', deleteDua);

export default router;
