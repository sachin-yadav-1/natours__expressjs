const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// ROUTER
const router = express.Router();

// NO LOGIN REQUIRED
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

// LOGIN REQUIRED
router.use(authController.protected);
router.route('/me').get(userController.getMe, userController.getOneUser);
router.route('/updateMyPassword').post(authController.updateMyPassword);

// ADMIN ONLY ROUTES
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateOneUser)
  .delete(userController.deleteOneUser);

// EXPORTS
module.exports = router;
