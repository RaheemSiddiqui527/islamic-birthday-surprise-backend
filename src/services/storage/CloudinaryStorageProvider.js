import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { BaseStorageProvider } from './BaseStorageProvider.js';
import { config } from '../../config/index.js';

export class CloudinaryStorageProvider extends BaseStorageProvider {
  constructor() {
    super();
    const { cloudName, apiKey, apiSecret, folder } = config.storage.cloudinary;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary storage provider is selected (STORAGE_PROVIDER=cloudinary) but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET are missing in environment variables. Refusing silent fallback.'
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    this.folder = folder;
    this.providerName = 'cloudinary';
  }

  async uploadPhoto(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `${this.folder}/photos`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      // Generate a fast, optimized WebP thumbnail URL using Cloudinary transformations
      const thumbnailPath = cloudinary.url(result.public_id, {
        width: 600,
        height: 600,
        crop: 'fill',
        gravity: 'auto',
        fetch_format: 'webp',
        quality: 'auto',
        secure: true
      });

      // Cleanup local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        filePath: result.secure_url,
        thumbnailPath: thumbnailPath || result.secure_url,
        storageKey: result.public_id
      };
    } catch (err) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Cloudinary photo upload failed: ${err.message}`);
    }
  }

  async uploadVideo(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `${this.folder}/videos`,
        resource_type: 'video'
      });

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        filePath: result.secure_url,
        storageKey: result.public_id
      };
    } catch (err) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Cloudinary video upload failed: ${err.message}`);
    }
  }

  async uploadAudio(file) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `${this.folder}/audio`,
        resource_type: 'video' // Cloudinary stores audio under video resource_type
      });

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        filePath: result.secure_url,
        storageKey: result.public_id
      };
    } catch (err) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error(`Cloudinary audio upload failed: ${err.message}`);
    }
  }

  async deleteFile(filePath, storageKey) {
    if (!storageKey) return false;
    try {
      await cloudinary.uploader.destroy(storageKey, { invalidate: true });
      return true;
    } catch (err) {
      console.warn(`[Cloudinary] Deletion failed for storageKey ${storageKey}:`, err.message);
      return false;
    }
  }
}
