const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// APP SETUP
const app = express();
dotenv.config();
app.use(express.json({ limit: '10kb' })); // Will not process any request above '10kb' size

// DATA SANITIZATION: NoSQL QUER INJECTIONS
// Removes all the '$' signs and other operators from request body and params
app.use(mongoSanitize());

// DATA SANITIZATION: XSS ATTACKS
// Removes malicious HTML or any other code by removing HTML tags to HTML symbols
app.use(xss());

// SECURITY HTTP HEADERS
app.use(helmet());

// RATE LIMITER
// Limits the number of requests in a given time frame ( in this case: 1hr )
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in an hour.',
});

// Limit requests only to 'api' routes
app.use('/api', limiter);

// PREVENT PARAMETER POLLUTION
// Removes duplicate parameters from the request
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
    ],
  })
);

// SERVE STATIC FILES
// Server static files from 'public' folder
app.use(express.static(`${__dirname}/public`));

// MOUNTING ROUTES
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/bookings', bookingRouter);

// UHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `The route ${req.originalUrl} is not defined on this server`,
      404
    )
  );
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

// EXPORTS
module.exports = app;
