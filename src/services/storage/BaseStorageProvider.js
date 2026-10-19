export class BaseStorageProvider {
  /**
   * Upload and process a photo
   * @param {Object} file Multer file object
   * @param {Object} options Optional metadata / caption
   * @returns {Promise<{ filePath: string, thumbnailPath: string, storageKey?: string }>}
   */
  async uploadPhoto(file, options = {}) {
    throw new Error('Method uploadPhoto() must be implemented.');
  }

  /**
   * Upload a video
   * @param {Object} file Multer file object
   * @param {Object} options
   * @returns {Promise<{ filePath: string, storageKey?: string }>}
   */
  async uploadVideo(file, options = {}) {
    throw new Error('Method uploadVideo() must be implemented.');
  }

  /**
   * Upload an audio file
   * @param {Object} file Multer file object
   * @param {Object} options
   * @returns {Promise<{ filePath: string, storageKey?: string }>}
   */
  async uploadAudio(file, options = {}) {
    throw new Error('Method uploadAudio() must be implemented.');
  }

  /**
   * Delete a stored media file
   * @param {string} filePath Relative path or full URL
   * @param {string} [storageKey] Cloudinary public_id or S3 key
   * @returns {Promise<boolean>}
   */
  async deleteFile(filePath, storageKey) {
    throw new Error('Method deleteFile() must be implemented.');
  }
}
