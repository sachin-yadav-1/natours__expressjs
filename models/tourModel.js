const mongoose = require('mongoose');
const slugify = require('slugify');

// TOUR SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },

    // This is not a property object. It's an embedded object for geospatial locations (GeoJSON)
    // In order for mongodB to identify it as a geospatial data, we need to pass 2 properties: type and coordinates
    // This document describes just a point on earth with the coordinates
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },

      // An array with first: Longitude and second: Latitude
      coordinates: [Number],
      address: String,
      description: String,
    },

    // Embedded document: We embedd documents by defining an array of objects
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
          coordinates: [Number],
          address: String,
          description: String,
          day: Number,
        },
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// CREATE INDEXES
tourSchema.index({ price: 1, ratings: -1 });
tourSchema.index({ slug: 1 });

// POPULATE GUIDES
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name',
  });

  next();
});

// CALCULATE DURATION
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE REVIEWS
// This is just to keep a reference of reviews on tours and at the same time do NOT add the property to the tour
// document
// This populates the reviews at the time of fetching one tour document
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// CREATE SLUG BEFORE SAVE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// TOUR MODEL
const Tour = mongoose.model('Tour', tourSchema);

// EXPORTS
module.exports = Tour;
