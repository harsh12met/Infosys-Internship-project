const User = require('../models/userModel');
const crypto = require('crypto');

// Generate unique access key
const generateAccessKey = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password, userType, role, accessKey } = req.body;

    console.log('📝 Signup Request:', { name, email, userType, role, accessKey: accessKey ? '***' : 'none' });

    // Validate input
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and user type'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    let userData = {
      name,
      email,
      password,
      userType,
      role: userType === 'single' ? 'none' : role
    };

    // Handle group users
    if (userType === 'group') {
      if (!role || (role !== 'leader' && role !== 'member')) {
        return res.status(400).json({
          success: false,
          message: 'Please specify role (leader or member) for group user'
        });
      }

      if (role === 'leader') {
        // Use provided access key from frontend or generate new one
        const newAccessKey = accessKey ? accessKey.toUpperCase() : generateAccessKey();
        
        console.log('👑 Creating Group Leader with access key:', newAccessKey);
        
        // Check if access key already exists (to ensure uniqueness)
        const existingKey = await User.findOne({ accessKey: newAccessKey });
        if (existingKey) {
          console.log('❌ Access key already exists:', newAccessKey);
          return res.status(400).json({
            success: false,
            message: 'This access key is already in use. Please create a new one.'
          });
        }
        
        userData.accessKey = newAccessKey;
        userData.groupId = newAccessKey; // Leader's groupId is same as accessKey
        
        console.log('✅ Leader data prepared:', { accessKey: newAccessKey, groupId: newAccessKey });
      } else if (role === 'member') {
        // Validate access key for member
        if (!accessKey) {
          console.log('❌ Member signup without access key');
          return res.status(400).json({
            success: false,
            message: 'Access key is required for group members'
          });
        }

        console.log('👤 Finding leader with access key:', accessKey.toUpperCase());

        // Find leader with this access key
        const leader = await User.findOne({ 
          accessKey: accessKey.toUpperCase(),
          role: 'leader'
        });

        if (!leader) {
          console.log('❌ No leader found with access key:', accessKey.toUpperCase());
          return res.status(400).json({
            success: false,
            message: 'Invalid access key. Please check with your group leader.'
          });
        }

        console.log('✅ Leader found:', { name: leader.name, groupId: leader.groupId });
        
        userData.groupId = leader.groupId;
        
        console.log('✅ Member data prepared:', { groupId: leader.groupId });
      }
    }

    console.log('💾 Creating user in database...');

    // Create new user
    const user = await User.create(userData);

    console.log('✅ User created successfully:', { id: user._id, name: user.name, role: user.role, groupId: user.groupId });

    // Return success response (excluding password)
    const response = {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        groupId: user.groupId,
        createdAt: user.createdAt
      }
    };

    // Include access key if leader
    if (user.role === 'leader' && user.accessKey) {
      response.user.accessKey = user.accessKey;
      console.log('🔑 Access key included in response for leader');
    }

    console.log('✅ Signup successful');

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Signup Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Login successful:', { 
      name: user.name, 
      role: user.role, 
      userType: user.userType,
      groupId: user.groupId 
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        groupId: user.groupId,
        accessKey: user.accessKey // Include access key for leaders
      }
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};
