const express = require('express');
const CareActivity = require('../models/CareActivity');
const Pet = require('../models/Pet');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Helper: ensure pet belongs to caller
async function assertOwnsPet(petId, userId) {
  const pet = await Pet.findOne({ _id: petId, owner: userId });
  if (!pet) {
    const err = new Error('Pet not found or not owned by user');
    err.status = 404;
    throw err;
  }
  return pet;
}

// POST /api/activities
router.post('/', async (req, res, next) => {
  try {
    const { pet: petId, type, title, notes, scheduledFor, completed } = req.body || {};
    if (!petId) return res.status(400).json({ message: 'pet is required' });
    await assertOwnsPet(petId, req.userId);

    const activity = await CareActivity.create({
      pet: petId,
      owner: req.userId,
      type,
      title,
      notes,
      scheduledFor,
      completed,
    });

    req.io?.to(`user:${req.userId}`).emit('activity:created', activity);

    // Emit a reminder if scheduled within the next 24h and not completed
    if (!activity.completed && activity.scheduledFor) {
      const diff = new Date(activity.scheduledFor).getTime() - Date.now();
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        req.io?.to(`user:${req.userId}`).emit('notification:reminder', {
          petId: activity.pet,
          activityId: activity._id,
          message: `Upcoming: ${activity.title}`,
          dueAt: activity.scheduledFor,
        });
      }
    }

    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
});

// GET /api/activities?petId=...&completed=true/false
router.get('/', async (req, res, next) => {
  try {
    const filter = { owner: req.userId };
    if (req.query.petId) filter.pet = req.query.petId;
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }
    const activities = await CareActivity.find(filter)
      .sort({ scheduledFor: -1 })
      .limit(500);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

// GET /api/activities/:id
router.get('/:id', async (req, res, next) => {
  try {
    const activity = await CareActivity.findOne({ _id: req.params.id, owner: req.userId });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activities/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { type, title, notes, scheduledFor, completed, pet: petId } = req.body || {};
    if (petId) await assertOwnsPet(petId, req.userId);

    const activity = await CareActivity.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { type, title, notes, scheduledFor, completed, ...(petId ? { pet: petId } : {}) },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    req.io?.to(`user:${req.userId}`).emit('activity:created', activity); // re-broadcast latest
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activities/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const activity = await CareActivity.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    req.io?.to(`user:${req.userId}`).emit('activity:created', {
      _id: activity._id,
      deleted: true,
      pet: activity.pet,
    });
    res.json({ message: 'Activity deleted', id: activity._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
