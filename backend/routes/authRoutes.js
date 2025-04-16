const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration endpoint
router.post('/register', authController.register);

// Login endpoint
router.post('/login', authController.login);

module.exports = router;