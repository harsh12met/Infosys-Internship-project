const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;
