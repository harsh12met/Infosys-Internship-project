const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all members of the current user's group
router.get('/group-members', userController.getGroupMembers);

// Get user notifications
router.get('/notifications', userController.getNotifications);

// Debug: Get all users (for testing)
router.get('/all', userController.getAllUsers);

module.exports = router;
