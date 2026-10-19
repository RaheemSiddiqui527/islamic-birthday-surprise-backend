import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { config } from '../config/index.js';

// Ensure upload directories exist
[
  config.paths.uploads,
  config.paths.photos,
  config.paths.thumbnails,
  config.paths.audio,
  config.paths.videos
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to generate a safe randomized filename
function generateSafeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 32);
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  return `${Date.now()}_${base}_${randomSuffix}${ext}`;
}

// Storage for Photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.photos);
  },
  filename: (req, file, cb) => {
    cb(null, generateSafeFilename(file.originalname));
  }
});

// Storage for Audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.audio);
  },
  filename: (req, file, cb) => {
    cb(null, generateSafeFilename(file.originalname));
  }
});

// Storage for Video
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.videos);
  },
  filename: (req, file, cb) => {
    cb(null, generateSafeFilename(file.originalname));
  }
});

// Photo File Filter
const photoFileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif', '.jfif'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedExt = allowedExts.includes(ext);
  const isAllowedMime =
    config.uploadLimits.allowedPhotoMimes.includes(mime) ||
    (mime === 'application/octet-stream' && isAllowedExt) ||
    (mime.startsWith('image/'));

  if (!isAllowedExt || !isAllowedMime) {
    return cb(
      new Error(`Invalid image format for "${file.originalname}". Allowed: JPG, PNG, WebP, HEIC, GIF.`),
      false
    );
  }
  cb(null, true);
};

// Audio File Filter
const audioFileFilter = (req, file, cb) => {
  const allowedExts = [
    '.mp3',
    '.m4a',
    '.aac',
    '.wav',
    '.ogg',
    '.opus',
    '.flac',
    '.webm',
    '.3gp',
    '.3gpp',
    '.mp4',
    '.wma'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedExt = allowedExts.includes(ext);
  const isAllowedMime =
    config.uploadLimits.allowedAudioMimes.includes(mime) ||
    mime.startsWith('audio/') ||
    (mime === 'application/octet-stream' && isAllowedExt);

  if (!isAllowedExt && !isAllowedMime) {
    return cb(
      new Error(`Invalid audio format for "${file.originalname}". Allowed formats: MP3, M4A, AAC, WAV, OGG, WebM, FLAC.`),
      false
    );
  }
  cb(null, true);
};

// Video File Filter
const videoFileFilter = (req, file, cb) => {
  const allowedExts = ['.mp4', '.webm', '.mov', '.m4v', '.3gp', '.3gpp', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const isAllowedExt = allowedExts.includes(ext);
  const isAllowedMime =
    config.uploadLimits.allowedVideoMimes.includes(mime) ||
    mime.startsWith('video/') ||
    (mime === 'application/octet-stream' && isAllowedExt);

  if (!isAllowedExt && !isAllowedMime) {
    return cb(
      new Error(`Invalid video format for "${file.originalname}". Allowed formats: MP4, WebM, MOV, M4V, 3GP.`),
      false
    );
  }
  cb(null, true);
};

export const uploadPhotos = multer({
  storage: photoStorage,
  limits: {
    fileSize: config.uploadLimits.maxPhotoSize,
    files: 25
  },
  fileFilter: photoFileFilter
});

export const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: config.uploadLimits.maxAudioSize },
  fileFilter: audioFileFilter
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: config.uploadLimits.maxVideoSize },
  fileFilter: videoFileFilter
});

// Safe file deletion helper to prevent path traversal outside uploads directory
export function safeDeleteFile(relativePath) {
  if (!relativePath) return;
  try {
    // Strip leading slashes and normalize
    const cleanRelative = relativePath.replace(/^(\/|\\)+/, '');
    const absolutePath = path.resolve(config.paths.root, cleanRelative);

    // Verify the resolved path is strictly inside config.paths.uploads
    if (!absolutePath.startsWith(path.resolve(config.paths.uploads))) {
      console.warn(`[Security] Blocked attempt to delete file outside upload dir: ${absolutePath}`);
      return;
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error(`[Storage] Failed to delete file ${relativePath}:`, err.message);
  }
}
