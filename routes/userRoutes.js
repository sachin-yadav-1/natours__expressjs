const express = require('express');
const authController = require('../controllers/authController');

// Create a Router
const router = express.Router();

// Login Not Required
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Login Required
router.route('/').get(authController.protected);

// Exports
module.exports = router;
