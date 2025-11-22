const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup - Register new user
router.post('/signup', authController.signup);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

module.exports = router;
