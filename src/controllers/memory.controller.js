import { Memory } from '../models/Memory.js';

export async function getMemories(req, res, next) {
  try {
    const memories = await Memory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json({ success: true, count: memories.length, memories });
  } catch (err) {
    next(err);
  }
}

export async function createMemory(req, res, next) {
  try {
    const highest = await Memory.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    const sortOrder = (highest?.sortOrder || 0) + 1;

    const memory = await Memory.create({
      ...req.body,
      sortOrder: req.body.sortOrder ?? sortOrder
    });

    res.status(201).json({
      success: true,
      message: 'Memory milestone created successfully',
      memory
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMemory(req, res, next) {
  try {
    const { id } = req.params;
    const memory = await Memory.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!memory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    res.json({
      success: true,
      message: 'Memory milestone updated successfully',
      memory
    });
  } catch (err) {
    next(err);
  }
}

export async function reorderMemories(req, res, next) {
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
      await Memory.bulkWrite(updateOps);
    }

    res.json({ success: true, message: 'Memories order updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteMemory(req, res, next) {
  try {
    const { id } = req.params;
    const memory = await Memory.findByIdAndDelete(id);

    if (!memory) {
      return res.status(404).json({ success: false, error: 'Memory not found' });
    }

    res.json({ success: true, message: 'Memory milestone deleted successfully' });
  } catch (err) {
    next(err);
  }
}
