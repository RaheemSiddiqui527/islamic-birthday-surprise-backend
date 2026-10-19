import express from 'express';
import {
  getAudioTracks,
  uploadAudioTrack,
  setActiveAudioTrack,
  updateAudioTrack,
  deleteAudioTrack
} from '../controllers/audio.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadAudio } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAudioTracks);
router.post('/upload', uploadAudio.single('audio'), uploadAudioTrack);
router.patch('/:id/activate', setActiveAudioTrack);
router.put('/:id/activate', setActiveAudioTrack);
router.patch('/:id', updateAudioTrack);
router.put('/:id', updateAudioTrack);
router.delete('/:id', deleteAudioTrack);

export default router;
