import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Memory title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Memory description is required'],
      trim: true
    },
    dateOrPeriod: {
      type: String,
      default: '',
      trim: true
    },
    iconName: {
      type: String,
      default: 'sparkles',
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

memorySchema.index({ isPublished: 1, sortOrder: 1 });

export const Memory = mongoose.model('Memory', memorySchema);
