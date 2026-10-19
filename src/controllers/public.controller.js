import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { BirthdayLetter } from '../models/BirthdayLetter.js';
import { DuaCard } from '../models/DuaCard.js';
import { Photo } from '../models/Photo.js';
import { Memory } from '../models/Memory.js';
import { AudioTrack } from '../models/AudioTrack.js';
import { VideoEntry } from '../models/VideoEntry.js';

function sanitizeForbiddenPhrases(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/Happy\s*Birthday/gi, 'Janamdin Mubarak');
}

export async function getPublicContent(req, res, next) {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // 1. Settings
    let settings = await WebsiteSettings.findOne().lean();
    if (!settings) {
      settings = {
        brotherName: 'Kareem Bhai',
        mainHeading: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
        introGreeting: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        introSubheading: 'Mere azeez, muhtaram aur rehnuma bhai ke naam ek dil-se tohfa',
        heroTagline: 'Duaon, Mohabbat aur Qadardani se bhara ek pyara safar',
        signOff: 'Aapke Chhote Bhai Ki Taraf Se ❤️',
        metaTitle: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
        metaDescription: 'Kareem Bhai ke janamdin par duaon aur yaadon ka ek pyara tohfa.',
        themePrimary: '#047857',
        themeSecondary: '#d4af37',
        themeBgDark: '#022c22',
        enableParticles: true,
        enableLanterns: true,
        enableNasheed: true,
        enableLetter: true,
        enableDuas: true,
        enableGallery: true,
        enableMemories: true,
        enableVideo: true
      };
    }

    // Strictly enforce non-negotiable greeting
    if (!settings.mainHeading || /Happy\s*Birthday/i.test(settings.mainHeading)) {
      settings.mainHeading = 'JANAMDIN MUBARAK, BHAI JAAN ❤️';
    }

    // 2. Birthday Letter
    let letter = null;
    if (settings.enableLetter) {
      const letterDoc = await BirthdayLetter.findOne().lean();
      if (letterDoc) {
        letter = {
          title: sanitizeForbiddenPhrases(letterDoc.title),
          salutation: sanitizeForbiddenPhrases(letterDoc.salutation),
          paragraphs: (letterDoc.paragraphs || []).map(sanitizeForbiddenPhrases),
          closingDua: sanitizeForbiddenPhrases(letterDoc.closingDua),
          signOff: sanitizeForbiddenPhrases(letterDoc.signOff)
        };
      }
    }

    // 3. Dua Cards (Published Only)
    let duas = [];
    if (settings.enableDuas) {
      duas = await DuaCard.find({ isPublished: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    }

    // 4. Photos (Published Only)
    let photos = [];
    let coverPhoto = null;
    if (settings.enableGallery) {
      photos = await Photo.find({ isPublished: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .select('filename originalName filePath thumbnailPath caption description photoDate isCover sortOrder')
        .lean();

      coverPhoto = photos.find(p => p.isCover) || (photos.length > 0 ? photos[0] : null);
    }

    // 5. Memories (Published Only)
    let memories = [];
    if (settings.enableMemories) {
      memories = await Memory.find({ isPublished: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
    }

    // 6. Active Audio Track
    let activeAudio = null;
    if (settings.enableNasheed) {
      activeAudio = await AudioTrack.findOne({ isActive: true })
        .select('title artist filePath duration volumeDefault autoplayAfterInteraction')
        .lean();

      if (!activeAudio) {
        activeAudio = await AudioTrack.findOne()
          .sort({ createdAt: -1 })
          .select('title artist filePath duration volumeDefault autoplayAfterInteraction')
          .lean();
      }
    }

    // 7. Video Entries (All published videos for playlist / tabs)
    let video = null;
    let videos = [];
    if (settings.enableVideo) {
      videos = await VideoEntry.find({ isPublished: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .select('title description videoType videoUrl filePath coverImagePath isGoogleFlow isPublished')
        .lean();
      video = videos.length > 0 ? videos[0] : null;
    }

    res.json({
      success: true,
      data: {
        settings: {
          ...settings,
          brotherName: sanitizeForbiddenPhrases(settings.brotherName),
          mainHeading: sanitizeForbiddenPhrases(settings.mainHeading),
          introSubheading: sanitizeForbiddenPhrases(settings.introSubheading),
          heroTagline: sanitizeForbiddenPhrases(settings.heroTagline),
          signOff: sanitizeForbiddenPhrases(settings.signOff),
          metaTitle: sanitizeForbiddenPhrases(settings.metaTitle),
          metaDescription: sanitizeForbiddenPhrases(settings.metaDescription)
        },
        letter,
        duas,
        photos,
        coverPhoto,
        memories,
        audio: activeAudio,
        video,
        videos
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicPhotos(req, res, next) {
  try {
    const photos = await Photo.find({ isPublished: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('filename originalName filePath thumbnailPath caption description photoDate isCover sortOrder')
      .lean();

    res.json({ success: true, count: photos.length, photos });
  } catch (err) {
    next(err);
  }
}

export async function getPublicDuas(req, res, next) {
  try {
    const duas = await DuaCard.find({ isPublished: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.json({ success: true, count: duas.length, duas });
  } catch (err) {
    next(err);
  }
}

export async function sayAameen(req, res, next) {
  try {
    const { id } = req.params;
    const dua = await DuaCard.findOne({ _id: id, isPublished: true });

    if (!dua) {
      return res.status(404).json({ success: false, error: 'Dua card not found or unpublished.' });
    }

    dua.aameenCount += 1;
    await dua.save();

    res.json({
      success: true,
      duaId: dua._id,
      aameenCount: dua.aameenCount
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicAudio(req, res, next) {
  try {
    const activeAudio = await AudioTrack.findOne({ isActive: true })
      .select('title artist filePath duration volumeDefault autoplayAfterInteraction')
      .lean();

    res.json({ success: true, audio: activeAudio });
  } catch (err) {
    next(err);
  }
}

export async function getPublicVideos(req, res, next) {
  try {
    const videos = await VideoEntry.find({ isPublished: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('title description videoType videoUrl filePath coverImagePath isGoogleFlow isPublished')
      .lean();

    res.json({ success: true, count: videos.length, videos });
  } catch (err) {
    next(err);
  }
}
