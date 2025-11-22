const Notification = require('../models/notificationModel');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark All As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read'
    });
  }
};

// Create notification (helper function)
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    console.log('📬 Notification created:', notificationData.title);
    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
  }
};
