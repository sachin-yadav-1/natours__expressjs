const jwt = require('jsonwebtoken');

// Sign and Send JWT Token
// @param : {id} - User Id
// @param : {statusCode} - Response status code in case of success
module.exports = (id, res, statusCode, doc) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  const cookieOptions = {
    expires: process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
    httpOnly: true, // Cookie cannot be modiefied in any way by the browser
  };

  // SEND COOKIE
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    doc,
  });
};
