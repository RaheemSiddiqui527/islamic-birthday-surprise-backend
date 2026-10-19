import mongoose from 'mongoose';

const videoEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    videoType: {
      type: String,
      enum: ['url', 'upload'],
      default: 'url'
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true
    },
    filePath: {
      type: String,
      default: '',
      trim: true
    },
    coverImagePath: {
      type: String,
      default: '',
      trim: true
    },
    isGoogleFlow: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    storageKey: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

videoEntrySchema.index({ isPublished: 1, sortOrder: 1 });

export const VideoEntry = mongoose.model('VideoEntry', videoEntrySchema);
