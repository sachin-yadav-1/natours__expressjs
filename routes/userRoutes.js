const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// ROUTER
const router = express.Router();

// Multer
const upload = multer({ dest: 'public/img2' });

// NO LOGIN REQUIRED
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

// LOGIN REQUIRED
router.use(authController.protected);
router.route('/me').get(userController.getMe, userController.getOneUser);
router.route('/updateMyPassword').post(authController.updateMyPassword);
router
  .route('/updateMe')
  .patch(upload.single('photo'), userController.updateMe);
router
  .route('/deleteMe')
  .delete(authController.protected, userController.deleteMe);

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
