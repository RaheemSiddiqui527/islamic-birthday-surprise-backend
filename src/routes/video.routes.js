import express from 'express';
import {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo
} from '../controllers/video.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadVideo } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getVideos);
router.post('/', uploadVideo.single('video'), createVideo);
router.patch('/:id', updateVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
