const jwt = require('jsonwebtoken');

// Sign and Send JWT Token
// @param : {id} - User Id
// @param : {statusCode} - Response status code in case of success
module.exports = (id, res, statusCode) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};
