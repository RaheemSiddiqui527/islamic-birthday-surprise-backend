import express from 'express';
import {
  getPublicContent,
  getPublicPhotos,
  getPublicDuas,
  sayAameen,
  getPublicAudio,
  getPublicVideos
} from '../controllers/public.controller.js';
import { aameenLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.get('/content', getPublicContent);
router.get('/photos', getPublicPhotos);
router.get('/duas', getPublicDuas);
router.post('/duas/:id/aameen', aameenLimiter, sayAameen);
router.get('/audio', getPublicAudio);
router.get('/videos', getPublicVideos);

export default router;
