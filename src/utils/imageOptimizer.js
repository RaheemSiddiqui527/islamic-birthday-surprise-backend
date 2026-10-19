import path from 'path';
import sharp from 'sharp';
import { config } from '../config/index.js';

export async function processUploadedImage(originalFilePath, filename) {
  try {
    const parsed = path.parse(filename);
    const thumbFilename = `thumb_${parsed.name}.webp`;
    const thumbFilePath = path.join(config.paths.thumbnails, thumbFilename);

    await sharp(originalFilePath)
      .rotate() // auto-orient based on EXIF
      .resize({
        width: 600,
        height: 600,
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 82 })
      .toFile(thumbFilePath);

    return {
      thumbFilename,
      thumbFilePath: `/uploads/thumbnails/${thumbFilename}`
    };
  } catch (err) {
    console.error('[Sharp] Error generating thumbnail:', err.message);
    // Graceful fallback to original image url if sharp processing fails
    return {
      thumbFilename: filename,
      thumbFilePath: `/uploads/photos/${filename}`
    };
  }
}
