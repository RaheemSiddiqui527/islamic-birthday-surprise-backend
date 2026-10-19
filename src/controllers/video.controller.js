import { VideoEntry } from '../models/VideoEntry.js';
import { getStorageProvider } from '../services/storage/index.js';

export async function getVideos(req, res, next) {
  try {
    const videos = await VideoEntry.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json({ success: true, count: videos.length, videos });
  } catch (err) {
    next(err);
  }
}

export async function createVideo(req, res, next) {
  try {
    const file = req.file;
    const { title, description, videoType, videoUrl, isGoogleFlow, isPublished } = req.body;

    let filePath = '';
    let storageKey = '';

    if (file) {
      const storage = getStorageProvider();
      const uploadResult = await storage.uploadVideo(file);
      filePath = uploadResult.filePath;
      storageKey = uploadResult.storageKey || '';
    }

    const video = await VideoEntry.create({
      title: title || 'Bhai Jaan Birthday Video',
      description: description || '',
      videoType: file ? 'upload' : (videoType || 'url'),
      videoUrl: videoUrl || '',
      filePath,
      storageKey,
      isGoogleFlow: isGoogleFlow === 'true' || isGoogleFlow === true,
      isPublished: isPublished === undefined ? true : (isPublished === 'true' || isPublished === true)
    });

    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      video
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVideo(req, res, next) {
  try {
    const { id } = req.params;
    const video = await VideoEntry.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const { title, description, videoUrl, isGoogleFlow, isPublished, sortOrder } = req.body;

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (isGoogleFlow !== undefined) video.isGoogleFlow = isGoogleFlow;
    if (isPublished !== undefined) video.isPublished = isPublished;
    if (sortOrder !== undefined) video.sortOrder = sortOrder;

    await video.save();

    res.json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteVideo(req, res, next) {
  try {
    const { id } = req.params;
    const video = await VideoEntry.findById(id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    if (video.filePath) {
      const storage = getStorageProvider();
      await storage.deleteFile(video.filePath, video.storageKey);
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
