const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Create a Router
const router = express.Router();

// Login Not Required
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

// Login Required
router.use(authController.protected);
router.route('/me').get(userController.getMe);
router.route('/updateMyPassword').post(authController.updateMyPassword);

// Admin Only
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateOneUser)
  .delete(userController.deleteOneUser);

// Exports
module.exports = router;
