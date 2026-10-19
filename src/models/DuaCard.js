import mongoose from 'mongoose';

const duaCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Dua title is required'],
      trim: true
    },
    arabicText: {
      type: String,
      trim: true
    },
    urduText: {
      type: String,
      required: [true, 'Urdu prayer text is required'],
      trim: true
    },
    englishMeaning: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      default: 'Barkat',
      trim: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    aameenCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

duaCardSchema.index({ isPublished: 1, sortOrder: 1 });

export const DuaCard = mongoose.model('DuaCard', duaCardSchema);
