import express from 'express';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
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

// Direct stream sync endpoint for large video synchronization
router.post('/sync-file', (req, res) => {
  const filename = req.query.filename;
  if (!filename || !/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const targetDir = config.paths.videos;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const destPath = path.join(targetDir, filename);
  const writeStream = fs.createWriteStream(destPath);
  req.pipe(writeStream);

  writeStream.on('finish', () => {
    const size = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;
    console.log(`[VideoSync] Successfully synced ${filename} (${size} bytes)`);
    res.json({ success: true, filename, size });
  });

  writeStream.on('error', (err) => {
    console.error(`[VideoSync] Error syncing ${filename}:`, err.message);
    res.status(500).json({ error: err.message });
  });
});

router.patch('/:id', updateVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
