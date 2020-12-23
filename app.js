const express = require('express');
const dotenv = require('dotenv');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController.js');

const tourRouter = require('./routes/tourRoutes');

// App Setup
const app = express();
app.use(express.json());
dotenv.config();

// Mounting Routes
app.use('/api/tours', tourRouter);

// Unexpected Route
app.all('*', (req, res, next) => {
  next(new AppError('This route is not defined on this server', 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Exports
module.exports = app;
