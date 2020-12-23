const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// Create a Router
const router = express.Router();

// All Routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createNewTour);

// Specific Routes
router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateOneTour)
  .delete(tourController.deleteOneTour);

// Exports
module.exports = router;
