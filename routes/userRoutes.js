const express = require('express');
const authController = require('../controllers/authController');

// Create a Router
const router = express.Router();

// Login Not Required
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:resetToken', authController.resetPassword);

// Login Required
router.use(authController.protected);
router.route('/updateMyPassword').post(authController.updateMyPassword);

// Exports
module.exports = router;
