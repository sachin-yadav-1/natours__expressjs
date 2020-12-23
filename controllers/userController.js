const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// GET ME
// This route is used to display the profile of currently logged in user
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allUsers = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      allUsers,
    },
  });
});

// Get One User
exports.getOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('No user found with the Id!', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Update User
exports.updateOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  if (!user) return next(new AppError('No user found with the Id!', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Delete User
exports.deleteOneUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id, req.body);
  if (!user) return next(new AppError('No user found with the Id!', 404));

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
