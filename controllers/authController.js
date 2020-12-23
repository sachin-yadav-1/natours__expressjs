const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const signAndSendJWT = require('../utils/signAndSendJWT');

// Signup
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  signAndSendJWT(newUser._id, res, 201);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please enter both email and password!', 400));

  // Check if user exists with the email
  const user = await User.findOne({ email: req.body.email });

  // Check if the password matches
  if (!user || !(await user.checkPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect email or password!', 404));

  signAndSendJWT(user._id, res, 200);
});

// PROTECTED ROUTES
// This middleware is used before all the routes that requires login
// To ensure a login the method does the following things:
// 1) Checks if bearer token exists in the request headers, if NOT it throws an error
// 2) Checks if token is a valid token using 'verify' method on jwt
// 3) Checks and fetches any user that exists with the id in the token, if NOT, throws an error
// 4) Checks if password was updated after jwt token was issued, if YES, throws an error
// 5) If all above checks are done, it saves user in 'request.user' and grants the access by going to next middleware
exports.protected = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Please login to continue!', 400));

  // Verify Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Fetch User
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('Token invalid or expired', 404));

  // If Password Changed
  if (user.passwordChangedAfterJWT(decoded.iat))
    return next(
      new AppError('Password recently changed. Please login again!', 400)
    );

  // Save User
  req.user = user;

  // Grant Access
  next();
});

// RESTRICTED PERSMISSIONS
// This middleware is used for restricting different permissions from different users
// It recieves an array of roles and check if the array inclues the role of the user, if NOT, throws an error
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("You're not authorized for this route!", 400));

    next();
  };
};
