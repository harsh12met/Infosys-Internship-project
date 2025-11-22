const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedToName: String,
  assignedToEmail: String,
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const columnSchema = new mongoose.Schema({
  id: String,
  title: String,
  order: {
    type: Number,
    default: 0
  },
  tasks: [taskSchema]
});

const boardSchema = new mongoose.Schema({
  // For single users, use userId; for groups, use groupId
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  ownerType: {
    type: String,
    enum: ['user', 'group'],
    required: true
  },
  name: {
    type: String,
    default: 'My Kanban Board'
  },
  columns: [columnSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
boardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
