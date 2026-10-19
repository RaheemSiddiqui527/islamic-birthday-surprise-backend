import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { Photo } from '../models/Photo.js';
import { DuaCard } from '../models/DuaCard.js';
import { Memory } from '../models/Memory.js';
import { AudioTrack } from '../models/AudioTrack.js';
import { VideoEntry } from '../models/VideoEntry.js';

export async function getDashboardStats(req, res, next) {
  try {
    const totalPhotos = await Photo.countDocuments();
    const publishedPhotos = await Photo.countDocuments({ isPublished: true });
    const unpublishedPhotos = totalPhotos - publishedPhotos;

    const totalDuas = await DuaCard.countDocuments();
    const publishedDuas = await DuaCard.countDocuments({ isPublished: true });

    const aameenAgg = await DuaCard.aggregate([
      { $group: { _id: null, total: { $sum: '$aameenCount' } } }
    ]);
    const totalAameen = aameenAgg[0]?.total || 0;

    const totalMemories = await Memory.countDocuments();
    const publishedMemories = await Memory.countDocuments({ isPublished: true });

    const coverPhoto = await Photo.findOne({ isCover: true }).lean();
    const activeAudio = await AudioTrack.findOne({ isActive: true }).lean();
    const activeVideo = await VideoEntry.findOne({ isPublished: true }).lean();

    const settings = await WebsiteSettings.findOne().lean();

    res.json({
      success: true,
      stats: {
        photos: {
          total: totalPhotos,
          published: publishedPhotos,
          unpublished: unpublishedPhotos
        },
        duas: {
          total: totalDuas,
          published: publishedDuas,
          totalAameen
        },
        memories: {
          total: totalMemories,
          published: publishedMemories
        },
        coverPhoto,
        activeAudio,
        activeVideo,
        settings
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req, res, next) {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings();
    }

    const payload = { ...req.body };

    // Disallow "Happy Birthday" in heading
    if (payload.mainHeading) {
      payload.mainHeading = payload.mainHeading.replace(/Happy\s*Birthday/gi, 'Janamdin Mubarak');
    }

    Object.assign(settings, payload);
    await settings.save();

    res.json({
      success: true,
      message: 'Birthday settings updated successfully',
      settings
    });
  } catch (err) {
    next(err);
  }
}
