import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema(
  {
    brotherName: {
      type: String,
      default: 'Kareem Bhai',
      trim: true
    },
    mainHeading: {
      type: String,
      default: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
      trim: true,
      set: function (val) {
        // Enforce prohibition of "Happy Birthday"
        if (!val || /Happy\s*Birthday/i.test(val)) {
          return 'JANAMDIN MUBARAK, BHAI JAAN ❤️';
        }
        return val.trim();
      }
    },
    introGreeting: {
      type: String,
      default: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      trim: true
    },
    introSubheading: {
      type: String,
      default: 'Mere azeez, muhtaram aur rehnuma bhai ke naam ek dil-se tohfa',
      trim: true
    },
    heroTagline: {
      type: String,
      default: 'Duaon, Mohabbat aur Qadardani se bhara ek pyara safar',
      trim: true
    },
    signOff: {
      type: String,
      default: 'Aapke Chhote Bhai Ki Taraf Se ❤️',
      trim: true
    },
    metaTitle: {
      type: String,
      default: 'JANAMDIN MUBARAK, BHAI JAAN ❤️',
      trim: true
    },
    metaDescription: {
      type: String,
      default: 'Kareem Bhai ke janamdin par duaon aur yaadon ka ek pyara tohfa.',
      trim: true
    },
    themePrimary: {
      type: String,
      default: '#047857' // emerald green
    },
    themeSecondary: {
      type: String,
      default: '#d4af37' // luxury gold
    },
    themeBgDark: {
      type: String,
      default: '#022c22' // deep Islamic night green
    },
    enableParticles: {
      type: Boolean,
      default: true
    },
    enableLanterns: {
      type: Boolean,
      default: true
    },
    enableNasheed: {
      type: Boolean,
      default: true
    },
    enableLetter: {
      type: Boolean,
      default: true
    },
    enableDuas: {
      type: Boolean,
      default: true
    },
    enableGallery: {
      type: Boolean,
      default: true
    },
    enableMemories: {
      type: Boolean,
      default: true
    },
    enableVideo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);
