const AppError = require('../utils/appError');

// DEVELOPMENT ERROR:
// In this case, we want to know about the error as much as possible
const sendDevErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }
};

// PRODUCTION ERROR
// In this case, it depends on the type of error
// If the isOperational property of the error is set to true, we will get as much as information we can
// If the error is non-operational, then we don't want the user to know about the details
const sendProdErr = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: err.status,
        message: 'Something went wrong!',
      });
    }
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// EXPORTS
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const environment = process.env.NODE_ENV;
  console.log(environment);

  if (environment === 'development') {
    sendDevErr(err, req, res);
  } else if (environment === 'production') {
    let error = { ...err };
    error.message = err.message;

    console.log(err.name);

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendProdErr(error, req, res);
  }
};
