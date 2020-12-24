const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// ROUTER
// Merge params from previous route
const router = express.Router({ mergeParams: true });

// NO LOGIN REQUIRED
router.route('/').get(reviewController.getAllReviews);
router.route('/:id').get(reviewController.getReview);

// USER ONLY ( LOGIN REQUIRED )
router.use(authController.protected, authController.restrictTo('user'));
router
  .route('/')
  .post(reviewController.setTourAndUserId, reviewController.createReview);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// EXPORTS
module.exports = router;
