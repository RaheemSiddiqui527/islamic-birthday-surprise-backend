import express from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';
import photoRoutes from './photo.routes.js';
import duaRoutes from './dua.routes.js';
import letterRoutes from './letter.routes.js';
import memoryRoutes from './memory.routes.js';
import audioRoutes from './audio.routes.js';
import videoRoutes from './video.routes.js';

const router = express.Router();

// Lightweight read-only health check for keep-alive workers and load balancers
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'Islamic Birthday Surprise API'
  });
});

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/photos', photoRoutes);
router.use('/admin/duas', duaRoutes);
router.use('/admin/letter', letterRoutes);
router.use('/admin/memories', memoryRoutes);
router.use('/admin/audio', audioRoutes);
router.use('/admin/videos', videoRoutes);

export default router;
