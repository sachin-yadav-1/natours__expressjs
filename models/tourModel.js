const mongoose = require('mongoose');

// Tour Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a name!'],
      unique: [true, 'Tour name already taken. Please try another one!'],
    },

    price: {
      type: String,
      required: [true, 'Tour must have a price!'],
    },

    summary: {
      type: String,
      required: [true, 'Please add tour summary'],
    },

    description: {
      type: String,
      required: [true, 'Please add tour description'],
    },

    difficulty: {
      type: String,
      required: [true, 'Please add tour difficulty'],
      enum: ['easy', 'medium', 'hard'],
    },

    imageCover: {
      type: String,
      required: [true, 'Please add cover image for the tour'],
    },

    images: [],
    startDates: [],
    ratingsQuantity: Number,
    ratingsAverage: Number,
    duration: Number,
    maxGroupSize: Number,
  },
  {
    timestamps: true,
  }
);

// Tour Model
const Tour = mongoose.model('Tour', tourSchema);

// Export
module.exports = Tour;
