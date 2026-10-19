import express from 'express';
import { login, logout, getSession, changePassword, changeUsername } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest, loginSchema, changePasswordSchema } from '../validators/index.js';

const router = express.Router();

router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/logout', requireAuth, logout);
router.get('/session', requireAuth, getSession);
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), changePassword);
router.post('/change-username', requireAuth, changeUsername);

export default router;
