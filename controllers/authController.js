const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const signAndSendJWT = require('../utils/signAndSendJWT');
const sendEmail = require('../utils/email');
const { RSA_NO_PADDING } = require('constants');

// SIGNUP
// This middleware is used for creating new users
// It performs the following steps:
// 1) Filters out the fields required to store into the database
// 2) Then logs in the user by sending 'jwt' as a response
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  signAndSendJWT(newUser._id, res, 201);
});

// LOGIN
// This middleware is used for login in users
// It performs the following steps:
// 1) Checks if both email and password exists in the request body, if NOT, throws an error
// 2) Checks if email or password are correct, if NOT, throws an error
// 3) If both above checks are successful, it send a 'jwt' as a response and the user is logged in
exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Please enter both email and password!', 400));

  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.checkPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect email or password!', 404));

  signAndSendJWT(user._id, res, 200);
});

// PROTECTED ROUTES
// This middleware is used before all the routes that requires login
// To ensure a login the method performs the following steps:
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

// FORGOT PASSWORD
// This method is used to send password reset link to users email when user requests for it
// It perfoms following steps:
// 1) Check is user exists with the provided email, if NOT, throws an error
// 2) Creates a password reset token, encrypts it and saves two properties to database:
//    'passwordResetToken' and 'passwordResetTokenExpires' which will be 10 mins from the time it is sent
// 3) Create a reset link with the reset token and sends it to the user's email
// 4) If error occours while sending email, remove reset token and expiration time from db
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('Incorrect email, please try again!', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}://${req.get(
    'host'
  )}/api/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Link ( VALID FOR 10 MINS)',
      message: `Forgot password? Follow the link: ${resetLink}`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    res.status(500).json({
      status: 'error',
      message: 'Error sending email, please try after some time!',
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

// RESET PASSWORD
// This method is used to creat a new password and save it to the db
// It performs following steps:
// 1) Create hash from the reset token in the link using crypto module
// 2) Check and fect user with matching reset token with the hash just created and where the expires time
//    is greater than now
// 3) If the checks are successful, set the new password and remove reset token and it's expiration time
// 4) If checks are not successful, throw an error
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashPassword = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashPassword,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token invalid or expired!', 404));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated!',
  });
});

// UPDATE PASSWORD
// This method is used to update the currently logged in user
// It performs the following steps:
// 1) Get the current user
// 2) Check if the current password is correct
// 3) If checks are successful, update the password
// 4) Send new jwt
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!(await user.checkPassword(req.body.currentPassword, user.password)))
    return next(new AppError("Password didn't match!", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  signAndSendJWT(user._id, res, 200);
});
