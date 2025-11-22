require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/userModel');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n📊 Fetching all users from database...\n');
    
    const users = await User.find({}).select('name email userType role groupId accessKey');
    
    console.log(`Total Users: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
    } else {
      console.log('Users List:');
      console.log('='.repeat(80));
      
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User Details:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   User Type: ${user.userType}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Group ID: ${user.groupId || 'N/A'}`);
        console.log(`   Access Key: ${user.accessKey || 'N/A'}`);
        console.log(`   MongoDB _id: ${user._id}`);
      });
      
      console.log('\n' + '='.repeat(80));
      
      // Group analysis
      const groups = {};
      users.forEach(user => {
        if (user.groupId) {
          if (!groups[user.groupId]) {
            groups[user.groupId] = [];
          }
          groups[user.groupId].push(user);
        }
      });
      
      console.log('\n📋 Group Analysis:');
      console.log('='.repeat(80));
      
      if (Object.keys(groups).length === 0) {
        console.log('⚠️  No groups found');
      } else {
        Object.keys(groups).forEach(groupId => {
          console.log(`\nGroup ID: ${groupId}`);
          console.log(`Members (${groups[groupId].length}):`);
          groups[groupId].forEach(member => {
            console.log(`  - ${member.name} (${member.email}) - Role: ${member.role}`);
          });
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUsers();
