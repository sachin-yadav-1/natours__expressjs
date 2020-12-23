const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create New Tour
exports.createNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'sucess',
    data: {
      tour: newTour,
    },
  });
});

// Get All Tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// Get One Tour
exports.getOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) return next(new AppError('No tour found for this id!', 400));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Update One Tour
exports.updateOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);

  if (!tour) return next(new AppError('No tour found for this id!', 400));

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Delete One Tour
exports.deleteOneTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) return next(new AppError('No tour found for this id!', 400));

  res.status(200).json({
    status: 'success',
    data: [],
  });
});
