const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    index: true
  },
  boardOwnerId: {
    type: String,
    required: false, // Made optional for backward compatibility
    index: true
  },
  boardOwnerType: {
    type: String,
    required: false, // Made optional for backward compatibility
    enum: ['user', 'group']
  },
  text: {
    type: String,
    required: true
  },
  authorId: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  viewedBy: {
    type: [String], // Array of user IDs who have viewed this comment
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
