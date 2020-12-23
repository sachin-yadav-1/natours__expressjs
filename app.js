const express = require('express');
const dotenv = require('dotenv');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// APP SETUP
const app = express();
app.use(express.json());
dotenv.config();

// MOUNTING ROUTES
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);

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
