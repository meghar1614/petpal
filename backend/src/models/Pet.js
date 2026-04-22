const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      maxlength: 60,
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'fish', 'reptile', 'rabbit', 'other'],
      default: 'other',
    },
    breed: { type: String, trim: true, maxlength: 60 },
    birthday: { type: Date },
    notes: { type: String, maxlength: 1000 },
    photoUrl: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
