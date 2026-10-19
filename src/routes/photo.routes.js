import express from 'express';
import {
  getPhotos,
  uploadPhotosHandler,
  updatePhoto,
  replacePhotoImage,
  reorderPhotos,
  deletePhoto
} from '../controllers/photo.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadPhotos } from '../middleware/upload.middleware.js';
import { validateRequest, photoUpdateSchema } from '../validators/index.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPhotos);
router.post('/', uploadPhotos.array('photos', 30), uploadPhotosHandler);
router.post('/upload', uploadPhotos.array('photos', 30), uploadPhotosHandler);
router.post('/:id/replace', uploadPhotos.single('photo'), replacePhotoImage);
router.post('/reorder', reorderPhotos);
router.patch('/:id', validateRequest(photoUpdateSchema), updatePhoto);
router.put('/:id', validateRequest(photoUpdateSchema), updatePhoto);
router.delete('/:id', deletePhoto);

export default router;
