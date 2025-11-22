const User = require('../models/userModel');

// Get all members of a group (for task assignment)
exports.getGroupMembers = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    console.log('getGroupMembers called with userId:', userId);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get current user to find their groupId
    const currentUser = await User.findById(userId);
    
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is part of a group
    if (currentUser.userType !== 'group' || !currentUser.groupId) {
      return res.status(400).json({
        success: false,
        message: 'User is not part of a group',
        debug: {
          userType: currentUser.userType,
          groupId: currentUser.groupId
        }
      });
    }

    console.log('🔍 Searching for group members with groupId:', currentUser.groupId);
    console.log('🔍 Current user details:', {
      id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      groupId: currentUser.groupId
    });

    // Get all members of the same group (including both leader and members)
    // Exclude the current user from the list
    const groupMembers = await User.find({
      groupId: currentUser.groupId,
      role: { $in: ['leader', 'member'] },
      _id: { $ne: userId } // Exclude current user
    }).select('_id name email role');

    console.log('✅ Found group members:', groupMembers.length, 'members');
    console.log('📋 Member details:', JSON.stringify(groupMembers, null, 2));

    res.status(200).json({
      success: true,
      members: groupMembers,
      count: groupMembers.length
    });

  } catch (error) {
    console.error('Get Group Members Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching group members',
      error: error.message
    });
  }
};

// Get user notifications (for task assignments)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // For now, return empty array - will be expanded with real notification system
    res.status(200).json({
      success: true,
      notifications: []
    });

  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

// Debug: Get all users (for testing)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email userType role groupId accessKey');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};
