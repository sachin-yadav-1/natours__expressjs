// APP ERROR
// This class is created for all the operational error that we can handle from our end
// Any error thrown through this class will have a property 'isOperational' set to 'true' so as to identify
// while handling different types of errors.
// @param {message}: Any error message we want to pass while throwing the error
// @param {statusCode}: Status code we define for different errors
// @param {name}: We do NOT pass this param while throwing error. This is just to set the name property
// on the error object
class AppError extends Error {
  constructor(message, statusCode, name) {
    super(message);

    this.name = name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// EXPORTS
module.exports = AppError;
