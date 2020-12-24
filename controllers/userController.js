const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// GET ME
// This middleware set id in params object to the id of currently logged in user
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

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
exports.getAllUsers = factory.getAll(User);
exports.getOneUser = factory.getOne(User);
exports.updateOneUser = factory.updateOne(User);
exports.deleteOneUser = factory.deleteOne(User);
