import { DuaCard } from '../models/DuaCard.js';

export async function getDuas(req, res, next) {
  try {
    const duas = await DuaCard.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json({ success: true, count: duas.length, duas });
  } catch (err) {
    next(err);
  }
}

export async function createDua(req, res, next) {
  try {
    const highest = await DuaCard.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = (highest?.sortOrder || 0) + 1;

    const dua = await DuaCard.create({
      ...req.body,
      sortOrder: req.body.sortOrder ?? sortOrder
    });

    res.status(201).json({
      success: true,
      message: 'Dua card created successfully',
      dua
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDua(req, res, next) {
  try {
    const { id } = req.params;
    const dua = await DuaCard.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!dua) {
      return res.status(404).json({ success: false, error: 'Dua card not found' });
    }

    res.json({
      success: true,
      message: 'Dua card updated successfully',
      dua
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderDuas(req, res, next) {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required.' });
    }

    const updateOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { sortOrder: index + 1 } }
      }
    }));

    if (updateOps.length > 0) {
      await DuaCard.bulkWrite(updateOps);
    }

    res.json({ success: true, message: 'Dua cards order updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteDua(req, res, next) {
  try {
    const { id } = req.params;
    const dua = await DuaCard.findByIdAndDelete(id);

    if (!dua) {
      return res.status(404).json({ success: false, error: 'Dua card not found' });
    }

    res.json({ success: true, message: 'Dua card deleted successfully' });
  } catch (err) {
    next(err);
  }
}
