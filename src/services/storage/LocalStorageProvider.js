import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { BaseStorageProvider } from './BaseStorageProvider.js';
import { config } from '../../config/index.js';

export class LocalStorageProvider extends BaseStorageProvider {
  constructor() {
    super();
    this.providerName = 'local';
    // Ensure directories exist
    [
      config.paths.uploads,
      config.paths.photos,
      config.paths.thumbnails,
      config.paths.audio,
      config.paths.videos
    ].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async uploadPhoto(file) {
    const filename = file.filename;
    const originalFilePath = file.path;
    const parsed = path.parse(filename);
    const thumbFilename = `thumb_${parsed.name}.webp`;
    const thumbFilePath = path.join(config.paths.thumbnails, thumbFilename);

    let finalFilename = filename;
    let finalFilePath = `/uploads/photos/${filename}`;

    try {
      // Auto-orient based on EXIF and generate lightweight WebP thumbnail
      await sharp(originalFilePath)
        .rotate()
        .resize({
          width: 600,
          height: 600,
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 82 })
        .toFile(thumbFilePath);

      // If uploaded from mobile iPhone/iPad as HEIC/HEIF, convert main image to WebP
      // so it can render natively across all desktop and mobile browsers
      const isHeic =
        ['.heic', '.heif'].includes(parsed.ext.toLowerCase()) ||
        (file.mimetype && file.mimetype.toLowerCase().includes('heic'));

      if (isHeic) {
        const webpFilename = `${parsed.name}.webp`;
        const webpFilePath = path.join(config.paths.photos, webpFilename);

        await sharp(originalFilePath)
          .rotate()
          .webp({ quality: 88 })
          .toFile(webpFilePath);

        if (fs.existsSync(originalFilePath) && originalFilePath !== webpFilePath) {
          fs.unlinkSync(originalFilePath);
        }

        finalFilename = webpFilename;
        finalFilePath = `/uploads/photos/${webpFilename}`;
      }

      return {
        filePath: finalFilePath,
        thumbnailPath: `/uploads/thumbnails/${thumbFilename}`,
        storageKey: finalFilename
      };
    } catch (err) {
      console.warn('[LocalStorage] Thumbnail/conversion fallback:', err.message);
      return {
        filePath: `/uploads/photos/${filename}`,
        thumbnailPath: `/uploads/photos/${filename}`,
        storageKey: filename
      };
    }
  }

  async uploadVideo(file) {
    return {
      filePath: `/uploads/videos/${file.filename}`,
      storageKey: file.filename
    };
  }

  async uploadAudio(file) {
    return {
      filePath: `/uploads/audio/${file.filename}`,
      storageKey: file.filename
    };
  }

  async deleteFile(filePath) {
    if (!filePath) return false;
    try {
      const cleanRelative = filePath.replace(/^\/?(uploads\/)?/, '');
      const candidatePaths = [
        path.resolve(config.paths.uploads, cleanRelative),
        path.resolve(config.paths.root, filePath.replace(/^(\/|\\)+/, ''))
      ];

      for (const absPath of candidatePaths) {
        // Enforce boundary check to prevent path traversal
        const inUploads = absPath.startsWith(path.resolve(config.paths.uploads));
        const inLegacy = absPath.startsWith(path.resolve(config.paths.legacyUploads));

        if ((inUploads || inLegacy) && fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn(`[LocalStorage] File deletion failed for ${filePath}:`, err.message);
      return false;
    }
  }
}
