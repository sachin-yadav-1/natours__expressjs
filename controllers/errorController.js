const AppError = require('../utils/appError');

// DEVELOPMENT ERROR:
// In this case, we want to know about the error as much as possible
const sendDevErr = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

// PRODUCTION ERROR
// In this case, it depends on the type of error
// If the isOperational property of the error is set to true, we will get as much as information we can
// If the error is non-operational, then we don't want the user to know about the details
const sendProdErr = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      status: err.status,
      message: 'Something went wrong!',
    });
  }
};

// EXPORTS
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const environment = process.env.NODE_ENV;
  console.log(environment);

  if (environment === 'development') sendDevErr(err, res);
  if (environment === 'production') sendProdErr(err, res);
};
