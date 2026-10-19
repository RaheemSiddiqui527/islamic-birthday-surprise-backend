import mongoose from 'mongoose';

const birthdayLetterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Mere Pyare Aur Azeez Bhai Jaan Ke Naam',
      trim: true
    },
    salutation: {
      type: String,
      default: 'Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh, Pyare Kareem Bhai,',
      trim: true
    },
    paragraphs: {
      type: [String],
      required: true,
      default: []
    },
    closingDua: {
      type: String,
      default: "Allah Ta'ala aap par hamesha apni khas rehmaton aur barkaton ka nuzool farmaye, aur hamara yeh bhai-bhai ka rishta duniya aur aakhirat dono mein salamat wa sarfaraz rakhe.",
      trim: true
    },
    signOff: {
      type: String,
      default: 'Aapke Chhote Bhai Ki Taraf Se ❤️',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const BirthdayLetter = mongoose.model('BirthdayLetter', birthdayLetterSchema);
