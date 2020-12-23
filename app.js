const express = require('express');
const dotenv = require('dotenv');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// APP SETUP
const app = express();
app.use(express.json());
dotenv.config();

// MOUNTING ROUTES
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);

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
