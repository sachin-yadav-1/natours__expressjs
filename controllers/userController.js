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

// ROUTE HANDLERS
exports.updateMe = catchAsync(async (req, res, next) => {
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
