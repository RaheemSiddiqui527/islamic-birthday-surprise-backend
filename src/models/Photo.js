import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
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
    thumbnailPath: {
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
    caption: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    photoDate: {
      type: String,
      default: ''
    },
    isCover: {
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

photoSchema.index({ isPublished: 1, sortOrder: 1 });
photoSchema.index({ isCover: 1 });

export const Photo = mongoose.model('Photo', photoSchema);
