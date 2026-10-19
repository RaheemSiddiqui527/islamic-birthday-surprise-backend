import express from 'express';
import { getDashboardStats, getSettings, updateSettings } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest, settingsSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/dashboard', getDashboardStats);
router.get('/settings', getSettings);
router.patch('/settings', validateRequest(settingsSchema), updateSettings);
router.put('/settings', validateRequest(settingsSchema), updateSettings);

export default router;
