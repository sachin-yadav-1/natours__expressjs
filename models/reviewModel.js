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

// CREATE INDEX TO PREVENT DUPLICATE REVIEWS
// This says that each combination of tour and user must be unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

// CALL AVERAGE RATING WHILE CREATING NEW REVIEW
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

// CALL AVERAGE RATING WHILE UPDATING OR DELETING REVIEW
// 1) We need to access the current review to extract the tourID
// 2) Calc statics and save in DB
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

// REVIEW MODEL
const Review = mongoose.model('Review', reviewSchema);

// EXPORTS
module.exports = Review;
