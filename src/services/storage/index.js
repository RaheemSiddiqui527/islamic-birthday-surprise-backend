import { config } from '../../config/index.js';
import { LocalStorageProvider } from './LocalStorageProvider.js';
import { CloudinaryStorageProvider } from './CloudinaryStorageProvider.js';

let storageInstance = null;

export function getStorageProvider() {
  if (storageInstance) return storageInstance;

  const providerType = config.storage.provider;

  if (providerType === 'cloudinary') {
    storageInstance = new CloudinaryStorageProvider();
  } else {
    // Default to managed local storage
    storageInstance = new LocalStorageProvider();
  }

  return storageInstance;
}

export { BaseStorageProvider } from './BaseStorageProvider.js';
export { LocalStorageProvider } from './LocalStorageProvider.js';
export { CloudinaryStorageProvider } from './CloudinaryStorageProvider.js';
