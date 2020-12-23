// CATCH ASYNCHRONOUS ERRORS
// This method is used to catch all the errors that occour in our route handler middlewares
// As soon as it encounters the error, it passes it to the 'next' funtion which throws it to our global error handler
// @param {fn}: Route handler middleware function
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
