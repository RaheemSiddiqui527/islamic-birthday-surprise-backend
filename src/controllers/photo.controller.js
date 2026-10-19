import { Photo } from '../models/Photo.js';
import { getStorageProvider } from '../services/storage/index.js';

export async function getPhotos(req, res, next) {
  try {
    const { search, published, page = 1, limit = 200 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    if (published !== undefined && published !== '') {
      filter.isPublished = published === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [photos, total] = await Promise.all([
      Photo.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Photo.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      photos
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadPhotosHandler(req, res, next) {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided.' });
    }

    const { caption, description, photoDate, isCover, isPublished } = req.body;
    const isCoverBool = isCover === 'true' || isCover === true;
    const isPublishedBool = isPublished === undefined ? true : (isPublished === 'true' || isPublished === true);

    // If setting as cover, unset any previous cover
    if (isCoverBool) {
      await Photo.updateMany({}, { isCover: false });
    }

    const highestSort = await Photo.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    let nextSort = (highestSort?.sortOrder || 0) + 1;

    const storage = getStorageProvider();
    const createdPhotos = [];
    const failedPhotos = [];

    for (const file of files) {
      try {
        const { filePath, thumbnailPath, storageKey } = await storage.uploadPhoto(file);

        const photo = await Photo.create({
          filename: file.filename || storageKey,
          originalName: file.originalname,
          filePath,
          thumbnailPath,
          storageKey: storageKey || '',
          mimeType: file.mimetype,
          fileSize: file.size,
          caption: caption || '',
          description: description || '',
          photoDate: photoDate || '',
          isCover: isCoverBool && createdPhotos.length === 0,
          isPublished: isPublishedBool,
          sortOrder: nextSort++
        });

        createdPhotos.push(photo);
      } catch (fileErr) {
        console.error(`[Upload] Failed to process ${file.originalname}:`, fileErr.message);
        failedPhotos.push({
          originalName: file.originalname,
          error: fileErr.message || 'File processing failed'
        });
      }
    }

    const isPartialOrFullSuccess = createdPhotos.length > 0;
    res.status(isPartialOrFullSuccess ? 201 : 400).json({
      success: isPartialOrFullSuccess,
      message: `${createdPhotos.length} photo(s) uploaded successfully.${failedPhotos.length > 0 ? ` ${failedPhotos.length} failed.` : ''}`,
      photos: createdPhotos,
      failed: failedPhotos
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const { caption, description, photoDate, isCover, isPublished, sortOrder } = req.body;

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found.' });
    }

    if (isCover !== undefined && isCover === true && !photo.isCover) {
      await Photo.updateMany({}, { isCover: false });
      photo.isCover = true;
    } else if (isCover !== undefined) {
      photo.isCover = isCover;
    }

    if (caption !== undefined) photo.caption = caption;
    if (description !== undefined) photo.description = description;
    if (photoDate !== undefined) photo.photoDate = photoDate;
    if (isPublished !== undefined) photo.isPublished = isPublished;
    if (sortOrder !== undefined) photo.sortOrder = sortOrder;

    await photo.save();

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo
    });
  } catch (err) {
    next(err);
  }
}

export async function replacePhotoImage(req, res, next) {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'New replacement image file is required.' });
    }

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found.' });
    }

    const storage = getStorageProvider();

    // Delete old files from storage provider safely
    await storage.deleteFile(photo.filePath, photo.storageKey);
    if (photo.thumbnailPath && photo.thumbnailPath !== photo.filePath) {
      await storage.deleteFile(photo.thumbnailPath);
    }

    // Process new image with storage provider
    const { filePath, thumbnailPath, storageKey } = await storage.uploadPhoto(file);

    photo.filename = file.filename || storageKey;
    photo.originalName = file.originalname;
    photo.filePath = filePath;
    photo.thumbnailPath = thumbnailPath;
    photo.storageKey = storageKey || '';
    photo.mimeType = file.mimetype;
    photo.fileSize = file.size;

    await photo.save();

    res.json({
      success: true,
      message: 'Photo image replaced successfully',
      photo
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderPhotos(req, res, next) {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required.' });
    }

    const updateOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index + 1 } }
      }
    }));

    if (updateOps.length > 0) {
      await Photo.bulkWrite(updateOps);
    }

    res.json({
      success: true,
      message: 'Photo order updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found.' });
    }

    const storage = getStorageProvider();
    await storage.deleteFile(photo.filePath, photo.storageKey);
    if (photo.thumbnailPath && photo.thumbnailPath !== photo.filePath) {
      await storage.deleteFile(photo.thumbnailPath);
    }

    await photo.deleteOne();

    res.json({
      success: true,
      message: 'Photo deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}
