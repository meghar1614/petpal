const express = require('express');
const Pet = require('../models/Pet');
const CareActivity = require('../models/CareActivity');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/pets - create
router.post('/', async (req, res, next) => {
  try {
    const { name, species, breed, birthday, notes, photoUrl } = req.body || {};
    const pet = await Pet.create({
      owner: req.userId,
      name,
      species,
      breed,
      birthday,
      notes,
      photoUrl,
    });
    req.io?.to(`user:${req.userId}`).emit('pet:updated', pet);
    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
});

// GET /api/pets - list owned pets
router.get('/', async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    next(err);
  }
});

// GET /api/pets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.userId });
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    next(err);
  }
});

// PUT /api/pets/:id
router.put('/:id', async (req, res, next) => {
  try {
    const update = (({ name, species, breed, birthday, notes, photoUrl }) => ({
      name, species, breed, birthday, notes, photoUrl,
    }))(req.body || {});

    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    req.io?.to(`user:${req.userId}`).emit('pet:updated', pet);
    res.json(pet);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    // cascade delete activities
    await CareActivity.deleteMany({ pet: pet._id, owner: req.userId });
    req.io?.to(`user:${req.userId}`).emit('pet:updated', { _id: pet._id, deleted: true });
    res.json({ message: 'Pet deleted', id: pet._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
