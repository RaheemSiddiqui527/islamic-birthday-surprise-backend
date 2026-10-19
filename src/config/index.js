import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const SERVER_DIR = path.resolve(__dirname, '../../');

// Determine local managed uploads folder: default to server/public/uploads
const customUploadDir = process.env.UPLOAD_DIR;
const defaultUploadDir = path.join(SERVER_DIR, 'public/uploads');
const UPLOAD_ROOT = customUploadDir ? path.resolve(ROOT_DIR, customUploadDir) : defaultUploadDir;

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  database: {
    uri: process.env.MONGODB_URI || '',
    dbPath: path.join(ROOT_DIR, 'data/mongodb')
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'kareem_bhai_islamic_surprise_default_jwt_secret_2026',
    expiresIn: '7d'
  },
  
  cookie: {
    name: process.env.COOKIE_NAME || 'kareem_admin_session',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  storage: {
    provider: (process.env.STORAGE_PROVIDER || 'local').toLowerCase(), // 'local' or 'cloudinary'
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      folder: process.env.CLOUDINARY_FOLDER || 'kareem_bhai_surprise'
    }
  },
  
  paths: {
    root: ROOT_DIR,
    server: SERVER_DIR,
    uploads: UPLOAD_ROOT,
    photos: path.join(UPLOAD_ROOT, 'photos'),
    thumbnails: path.join(UPLOAD_ROOT, 'thumbnails'),
    audio: path.join(UPLOAD_ROOT, 'audio'),
    videos: path.join(UPLOAD_ROOT, 'videos'),
    legacyUploads: path.join(ROOT_DIR, 'uploads')
  },
  
  uploadLimits: {
    maxPhotoSize: (parseInt(process.env.MAX_PHOTO_SIZE_MB, 10) || 25) * 1024 * 1024,
    maxAudioSize: (parseInt(process.env.MAX_AUDIO_SIZE_MB, 10) || 200) * 1024 * 1024,
    maxVideoSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 500) * 1024 * 1024,
    allowedPhotoMimes: [
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/heic-sequence',
      'image/heif-sequence',
      'image/jfif'
    ],
    allowedAudioMimes: [
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a',
      'audio/aac',
      'audio/x-aac',
      'audio/mp4',
      'audio/webm',
      'audio/opus',
      'audio/flac',
      'audio/x-flac',
      'audio/3gpp',
      'audio/3gpp2'
    ],
    allowedVideoMimes: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-m4v',
      'video/m4v',
      'video/3gpp',
      'video/3gp',
      'video/x-matroska',
      'video/mpeg'
    ]
  },
  
  keepAlive: {
    enabled: process.env.ENABLE_KEEP_ALIVE === 'true',
    url: process.env.KEEP_ALIVE_URL || 'http://localhost:5000/api/v1/health',
    intervalMs: parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 5000
  },
  
  initialAdmin: {
    username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'BhaiJaan@2026!'
  }
};

// Ensure upload folders exist
[config.paths.uploads, config.paths.photos, config.paths.thumbnails, config.paths.audio, config.paths.videos].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
