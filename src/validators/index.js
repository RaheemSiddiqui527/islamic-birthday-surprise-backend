import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const settingsSchema = z.object({
  brotherName: z.string().optional(),
  mainHeading: z.string().optional(),
  introGreeting: z.string().optional(),
  introSubheading: z.string().optional(),
  heroTagline: z.string().optional(),
  signOff: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  themePrimary: z.string().optional(),
  themeSecondary: z.string().optional(),
  themeBgDark: z.string().optional(),
  enableParticles: z.boolean().optional(),
  enableLanterns: z.boolean().optional(),
  enableNasheed: z.boolean().optional(),
  enableLetter: z.boolean().optional(),
  enableDuas: z.boolean().optional(),
  enableGallery: z.boolean().optional(),
  enableMemories: z.boolean().optional(),
  enableVideo: z.boolean().optional()
});

export const letterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  salutation: z.string().min(1, 'Salutation is required'),
  paragraphs: z.array(z.string()).min(1, 'At least one paragraph is required'),
  closingDua: z.string().min(1, 'Closing dua is required'),
  signOff: z.string().min(1, 'Sign-off is required')
});

export const duaCardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  arabicText: z.string().optional(),
  urduText: z.string().min(1, 'Urdu prayer text is required'),
  englishMeaning: z.string().optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional()
});

export const memorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dateOrPeriod: z.string().optional(),
  iconName: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional()
});

export const photoUpdateSchema = z.object({
  caption: z.string().optional(),
  description: z.string().optional(),
  photoDate: z.string().optional(),
  isCover: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export const audioUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  artist: z.string().optional(),
  volumeDefault: z.number().min(0).max(1).optional(),
  autoplayAfterInteraction: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  videoType: z.enum(['url', 'upload']).optional(),
  videoUrl: z.string().optional(),
  isGoogleFlow: z.boolean().optional(),
  isPublished: z.boolean().optional()
});

// Middleware generator for request validation
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      next(err);
    }
  };
}
