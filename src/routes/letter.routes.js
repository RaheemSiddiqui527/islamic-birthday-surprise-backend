import express from 'express';
import { getLetter, updateLetter } from '../controllers/letter.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest, letterSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getLetter);
router.patch('/', validateRequest(letterSchema), updateLetter);
router.put('/', validateRequest(letterSchema), updateLetter);

export default router;
