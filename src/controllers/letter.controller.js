import { BirthdayLetter } from '../models/BirthdayLetter.js';

export async function getLetter(req, res, next) {
  try {
    let letter = await BirthdayLetter.findOne();
    if (!letter) {
      letter = await BirthdayLetter.create({});
    }
    res.json({ success: true, letter });
  } catch (err) {
    next(err);
  }
}

export async function updateLetter(req, res, next) {
  try {
    let letter = await BirthdayLetter.findOne();
    if (!letter) {
      letter = new BirthdayLetter();
    }

    const { title, salutation, paragraphs, closingDua, signOff } = req.body;

    if (title !== undefined) letter.title = title;
    if (salutation !== undefined) letter.salutation = salutation;
    if (paragraphs !== undefined) {
      letter.paragraphs = Array.isArray(paragraphs)
        ? paragraphs.filter(p => p && p.trim().length > 0)
        : [paragraphs];
    }
    if (closingDua !== undefined) letter.closingDua = closingDua;
    if (signOff !== undefined) letter.signOff = signOff;

    await letter.save();

    res.json({
      success: true,
      message: 'Birthday letter updated successfully',
      letter
    });
  } catch (err) {
    next(err);
  }
}
