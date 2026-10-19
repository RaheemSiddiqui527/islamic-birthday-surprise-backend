import mongoose from 'mongoose';

const audioTrackSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    filePath: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true
    },
    artist: {
      type: String,
      default: 'Islamic Vocal Nasheed (No Instruments)',
      trim: true
    },
    duration: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    },
    volumeDefault: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    autoplayAfterInteraction: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

audioTrackSchema.index({ isActive: 1 });

export const AudioTrack = mongoose.model('AudioTrack', audioTrackSchema);
