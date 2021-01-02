const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// GET ME
// This middleware set id in params object to the id of currently logged in user
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// DELETE ME
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    message: 'Your account is deactivated. Your can recover it within 30 days',
  });
});

// FILE UPLOADS
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img2');
//   },

//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//   },
// });

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

// UPLOAD SINGLE
exports.uploadUserPhoto = upload.single('photo');

// RESIZE PHOTO
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img2/${req.file.filename}`);

  next();
});

// ROUTE HANDLERS
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Store filename to DB
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getOneUser = factory.getOne(User);
exports.updateOneUser = factory.updateOne(User);
exports.deleteOneUser = factory.deleteOne(User);
