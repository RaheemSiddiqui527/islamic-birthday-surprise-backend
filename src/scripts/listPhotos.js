import { connectDB, disconnectDB } from '../config/database.js';
import { Photo } from '../models/Photo.js';

async function listPhotos() {
  await connectDB();
  const photos = await Photo.find().sort({ sortOrder: 1, createdAt: 1 });
  console.log('TOTAL_PHOTOS_COUNT:' + photos.length);
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    console.log(JSON.stringify({
      index: i + 1,
      id: p._id,
      originalName: p.originalName,
      filename: p.filename,
      filePath: p.filePath,
      caption: p.caption,
      description: p.description,
      photoDate: p.photoDate,
      isCover: p.isCover
    }));
  }
  await disconnectDB();
  process.exit(0);
}

listPhotos();
