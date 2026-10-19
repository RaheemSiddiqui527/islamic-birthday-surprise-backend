import { AudioTrack } from '../models/AudioTrack.js';
import { getStorageProvider } from '../services/storage/index.js';

export async function getAudioTracks(req, res, next) {
  try {
    const tracks = await AudioTrack.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: tracks.length, tracks });
  } catch (err) {
    next(err);
  }
}

export async function uploadAudioTrack(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No audio file provided.' });
    }

    const { title, artist, isActive, volumeDefault, autoplayAfterInteraction } = req.body;
    const isActiveBool = isActive === 'true' || isActive === true;

    if (isActiveBool) {
      await AudioTrack.updateMany({}, { isActive: false });
    }

    const storage = getStorageProvider();
    const uploadResult = await storage.uploadAudio(file);

    const track = await AudioTrack.create({
      filename: file.filename,
      originalName: file.originalname,
      filePath: uploadResult.filePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      title: title || file.originalname.replace(/\.[^/.]+$/, ''),
      artist: artist || 'Islamic Vocal Nasheed (No Instruments)',
      isActive: isActiveBool,
      volumeDefault: volumeDefault ? parseFloat(volumeDefault) : 0.7,
      autoplayAfterInteraction: autoplayAfterInteraction !== undefined ? (autoplayAfterInteraction === 'true' || autoplayAfterInteraction === true) : true
    });

    res.status(201).json({
      success: true,
      message: 'Audio track uploaded successfully',
      track
    });
  } catch (err) {
    next(err);
  }
}

export async function setActiveAudioTrack(req, res, next) {
  try {
    const { id } = req.params;
    const track = await AudioTrack.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, error: 'Audio track not found' });
    }

    await AudioTrack.updateMany({}, { isActive: false });
    track.isActive = true;
    await track.save();

    res.json({
      success: true,
      message: `"${track.title}" is now the active nasheed`,
      track
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAudioTrack(req, res, next) {
  try {
    const { id } = req.params;
    const track = await AudioTrack.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, error: 'Audio track not found' });
    }

    const { title, artist, volumeDefault, autoplayAfterInteraction, isActive } = req.body;

    if (isActive !== undefined && isActive === true && !track.isActive) {
      await AudioTrack.updateMany({}, { isActive: false });
      track.isActive = true;
    } else if (isActive !== undefined) {
      track.isActive = isActive;
    }

    if (title !== undefined) track.title = title;
    if (artist !== undefined) track.artist = artist;
    if (volumeDefault !== undefined) track.volumeDefault = volumeDefault;
    if (autoplayAfterInteraction !== undefined) track.autoplayAfterInteraction = autoplayAfterInteraction;

    await track.save();

    res.json({
      success: true,
      message: 'Audio track updated successfully',
      track
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAudioTrack(req, res, next) {
  try {
    const { id } = req.params;
    const track = await AudioTrack.findById(id);

    if (!track) {
      return res.status(404).json({ success: false, error: 'Audio track not found' });
    }

    const storage = getStorageProvider();
    await storage.deleteFile(track.filePath);
    await track.deleteOne();

    res.json({
      success: true,
      message: 'Audio track deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
