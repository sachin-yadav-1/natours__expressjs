const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// ROUTER
const router = express.Router();

// REVIEW NESTED ROUTE
router.use('/:tourId/reviews', reviewRouter);

// NO LOGIN REQUIRED
router.route('/').get(tourController.getAllTours);
router.route('/:id').get(tourController.getOneTour);

// LOGIN REQUIRED
router.use(authController.protected, authController.restrictTo('admin', 'dba'));
router.route('/').post(tourController.createNewTour);
router
  .route('/:id')
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateOneTour
  )
  .delete(tourController.deleteOneTour);

// EXPORTS
module.exports = router;
