const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// POPULATE USERS
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// AVERAGE RATINGS
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },

    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};

// CALL AVERAGE RATING WHILE CREATING NEW REVIEW
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

// CALL AVERAGE RATING WHILE UPDATING OR DELETING REVIEW

// REVIEW MODEL
const Review = mongoose.model('Review', reviewSchema);

// EXPORTS
module.exports = Review;
