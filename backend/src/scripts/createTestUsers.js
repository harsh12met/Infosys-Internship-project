const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://kanban-user:kanban-user1234@kanbancluster.9rfardz.mongodb.net/kanban?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully!');

    // Clear existing test users (optional - comment out if you want to keep existing data)
    await User.deleteMany({ email: { $in: ['single@test.com', 'leader@test.com'] } });
    console.log('🗑️  Cleared existing test users');

    // Create Single User
    const singleUser = await User.create({
      name: 'Single User Test',
      email: 'single@test.com',
      password: 'test123',
      userType: 'single',
      role: 'none'
    });
    console.log('✅ Single User Created:');
    console.log('   📧 Email: single@test.com');
    console.log('   🔑 Password: test123');
    console.log('   👤 User Type: Single User');

    // Create Group Leader
    const accessKey = 'LEAD1234'; // Fixed access key for testing
    const groupLeader = await User.create({
      name: 'Group Leader Test',
      email: 'leader@test.com',
      password: 'test123',
      userType: 'group',
      role: 'leader',
      accessKey: accessKey,
      groupId: accessKey
    });
    console.log('\n✅ Group Leader Created:');
    console.log('   📧 Email: leader@test.com');
    console.log('   🔑 Password: test123');
    console.log('   👥 User Type: Group Leader');
    console.log('   🎫 Access Key: ' + accessKey);

    console.log('\n' + '='.repeat(60));
    console.log('✨ TEST CREDENTIALS READY ✨');
    console.log('='.repeat(60));
    console.log('\n📝 SINGLE USER LOGIN:');
    console.log('   Email: single@test.com');
    console.log('   Password: test123');
    console.log('\n📝 GROUP LEADER LOGIN:');
    console.log('   Email: leader@test.com');
    console.log('   Password: test123');
    console.log('   Access Key: LEAD1234 (share with team members)');
    console.log('\n' + '='.repeat(60));

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
