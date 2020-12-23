const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// Router
const router = express.Router();

// No Login Required
router.route('/').get(tourController.getAllTours);
router.route('/:id').get(tourController.getOneTour);

// Login Required
router.use(authController.protected, authController.restrictTo('admin', 'dba'));
router.route('/').post(tourController.createNewTour);
router
  .route('/:id')
  .patch(tourController.updateOneTour)
  .delete(tourController.deleteOneTour);

// Exports
module.exports = router;
