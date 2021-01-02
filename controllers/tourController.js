const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

// FILE UPLOADS
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image', 404), false);
  }
};

const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .toFile(`public/img2/${req.body.imageCover}`);

  // Other Images in Loop
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .toFile(`public/img2/${fileName}`);

      req.body.images.push(fileName);
    })
  );

  next();
});

// ROUTE HANDLERS
exports.createNewTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getOneTour = factory.getOne(Tour, {
  path: 'reviews',
  select: 'review rating user',
});
exports.updateOneTour = factory.updateOne(Tour);
exports.deleteOneTour = factory.deleteOne(Tour);
