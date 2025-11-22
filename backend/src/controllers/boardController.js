const Board = require('../models/boardModel');
const Comment = require('../models/commentModel');
const Notification = require('../models/notificationModel');

// Get board for a user or group
exports.getBoard = async (req, res) => {
  try {
    const { ownerId, ownerType } = req.query;

    if (!ownerId || !ownerType) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and owner type are required'
      });
    }

    let board = await Board.findOne({ ownerId, ownerType });

    // If board doesn't exist, create an empty one
    if (!board) {
      board = await Board.create({
        ownerId,
        ownerType,
        name: ownerType === 'group' ? `Group Board (${ownerId})` : 'My Kanban Board',
        columns: []
      });
    }

    res.status(200).json({
      success: true,
      board: board
    });
  } catch (error) {
    console.error('Get Board Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve board'
    });
  }
};

// Update entire board (columns and tasks)
exports.updateBoard = async (req, res) => {
  try {
    const { ownerId, ownerType, columns, name } = req.body;

    console.log('💾 UPDATE BOARD REQUEST:', {
      ownerId,
      ownerType,
      columnCount: columns?.length,
      totalTasks: columns?.reduce((sum, col) => sum + (col.tasks?.length || 0), 0)
    });

    if (!ownerId || !ownerType) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and owner type are required'
      });
    }

    let board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      // Create new board if it doesn't exist
      console.log('🆕 Creating new board');
      board = await Board.create({
        ownerId,
        ownerType,
        name: name || (ownerType === 'group' ? `Group Board (${ownerId})` : 'My Kanban Board'),
        columns: columns || []
      });
    } else {
      // Update existing board - REPLACE columns array completely
      console.log('🔄 Updating existing board - OLD state:', {
        oldColumnCount: board.columns.length,
        oldTotalTasks: board.columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0)
      });
      
      // Get all task IDs before update
      const oldTaskIds = [];
      board.columns.forEach(col => {
        col.tasks.forEach(task => oldTaskIds.push(String(task.id)));
      });
      
      // Get all task IDs after update
      const newTaskIds = [];
      columns.forEach(col => {
        col.tasks.forEach(task => newTaskIds.push(String(task.id)));
      });
      
      // Find deleted task IDs
      const deletedTaskIds = oldTaskIds.filter(id => !newTaskIds.includes(id));
      
      if (deletedTaskIds.length > 0) {
        console.log('🗑️ Cascade deleting comments and notifications for tasks:', deletedTaskIds);
        
        // Delete all comments for deleted tasks on THIS board only
        const commentsDeleted = await Comment.deleteMany({ 
          taskId: { $in: deletedTaskIds },
          boardOwnerId: ownerId,
          boardOwnerType: ownerType
        });
        console.log('💬 Deleted', commentsDeleted.deletedCount, 'comments from', ownerType, 'board', ownerId);
        
        // Delete all notifications for deleted tasks (using $in with string array)
        const notificationsDeleted = await Notification.deleteMany({ taskId: { $in: deletedTaskIds } });
        console.log('🔔 Deleted', notificationsDeleted.deletedCount, 'notifications');
        
        console.log('✅ Cascade deletion complete for', deletedTaskIds.length, 'tasks');
      }
      
      board.columns = columns || board.columns;
      if (name) board.name = name;
      await board.save();
      
      console.log('✅ Board updated - NEW state:', {
        newColumnCount: board.columns.length,
        newTotalTasks: board.columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0)
      });
    }

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      board: board
    });
  } catch (error) {
    console.error('❌ Update Board Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update board'
    });
  }
};

// Add a column to the board
exports.addColumn = async (req, res) => {
  try {
    const { ownerId, ownerType, column } = req.body;

    if (!ownerId || !ownerType || !column) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID, owner type, and column data are required'
      });
    }

    let board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      board = await Board.create({
        ownerId,
        ownerType,
        name: ownerType === 'group' ? `Group Board (${ownerId})` : 'My Kanban Board',
        columns: [column]
      });
    } else {
      board.columns.push(column);
      await board.save();
    }

    res.status(200).json({
      success: true,
      message: 'Column added successfully',
      board: board
    });
  } catch (error) {
    console.error('Add Column Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add column'
    });
  }
};

// Delete a column
exports.deleteColumn = async (req, res) => {
  try {
    const { ownerId, ownerType, columnId } = req.body;

    if (!ownerId || !ownerType || !columnId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID, owner type, and column ID are required'
      });
    }

    const board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Find the column to be deleted
    const columnToDelete = board.columns.find(col => col.id === columnId);
    
    if (columnToDelete && columnToDelete.tasks && columnToDelete.tasks.length > 0) {
      // Get all task IDs from this column
      const taskIds = columnToDelete.tasks.map(task => String(task.id));
      
      console.log('🗑️ Deleting column with', taskIds.length, 'tasks. Cascade deleting comments/notifications');
      
      // Delete all comments for these tasks on this board
      const commentsDeleted = await Comment.deleteMany({ 
        taskId: { $in: taskIds },
        boardOwnerId: ownerId,
        boardOwnerType: ownerType
      });
      console.log('💬 Deleted', commentsDeleted.deletedCount, 'comments');
      
      // Delete all notifications for these tasks
      const notificationsDeleted = await Notification.deleteMany({ 
        taskId: { $in: taskIds }
      });
      console.log('🔔 Deleted', notificationsDeleted.deletedCount, 'notifications');
    }

    // Remove the column
    board.columns = board.columns.filter(col => col.id !== columnId);
    await board.save();

    console.log('✅ Column deleted successfully with cascade cleanup');

    res.status(200).json({
      success: true,
      message: 'Column deleted successfully',
      board: board
    });
  } catch (error) {
    console.error('Delete Column Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete column'
    });
  }
};

// Add a task to a column
exports.addTask = async (req, res) => {
  try {
    const { ownerId, ownerType, columnId, task } = req.body;

    if (!ownerId || !ownerType || !columnId || !task) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID, owner type, column ID, and task data are required'
      });
    }

    const board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    column.tasks.push(task);
    await board.save();

    res.status(200).json({
      success: true,
      message: 'Task added successfully',
      board: board
    });
  } catch (error) {
    console.error('Add Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add task'
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { ownerId, ownerType, columnId, taskId, updates } = req.body;

    if (!ownerId || !ownerType || !columnId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID, owner type, column ID, and task ID are required'
      });
    }

    const board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    const task = column.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    Object.assign(task, updates);
    await board.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      board: board
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// Clear all board data (tasks, comments, notifications)
exports.clearBoard = async (req, res) => {
  try {
    const { ownerId, ownerType } = req.body;

    if (!ownerId || !ownerType) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and owner type are required'
      });
    }

    console.log('🧹 CLEARING BOARD for:', { ownerId, ownerType });

    // Find the board
    const board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Delete ALL comments and notifications for this owner (group or user)
    // This will clean up both active and orphaned data
    console.log('🗑️ Deleting ALL comments and notifications for owner:', ownerId);

    // Delete comments and notifications for THIS board only
    let commentsDeleted, notificationsDeleted;
    
    if (ownerType === 'group') {
      // Delete all comments for this group's board
      commentsDeleted = await Comment.deleteMany({ 
        boardOwnerId: ownerId,
        boardOwnerType: 'group'
      });
      
      // Get all users in this group for notification deletion
      const User = require('../models/userModel');
      const groupUsers = await User.find({ groupId: ownerId });
      const userIds = groupUsers.map(u => u._id.toString());
      
      console.log('👥 Found', groupUsers.length, 'users in group');
      
      // Delete all notifications for any user in this group
      notificationsDeleted = await Notification.deleteMany({ userId: { $in: userIds } });
    } else {
      // For single users, delete comments from their board
      commentsDeleted = await Comment.deleteMany({ 
        boardOwnerId: ownerId,
        boardOwnerType: 'user'
      });
      
      // Delete their notifications
      notificationsDeleted = await Notification.deleteMany({ userId: ownerId });
    }
    
    console.log('💬 Deleted', commentsDeleted.deletedCount, 'comments from', ownerType, 'board', ownerId);
    console.log('🔔 Deleted', notificationsDeleted.deletedCount, 'notifications');
    console.log('✅ All comments and notifications deleted');

    // NOW clear the board columns
    board.columns = [];
    await board.save();
    console.log('📋 Board columns cleared');

    res.status(200).json({
      success: true,
      message: 'Board data cleared successfully'
    });
  } catch (error) {
    console.error('❌ Clear Board Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear board data'
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { ownerId, ownerType, columnId, taskId } = req.body;

    if (!ownerId || !ownerType || !columnId || !taskId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID, owner type, column ID, and task ID are required'
      });
    }

    const board = await Board.findOne({ ownerId, ownerType });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const column = board.columns.find(col => col.id === columnId);
    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Column not found'
      });
    }

    column.tasks = column.tasks.filter(t => t.id !== taskId);
    await board.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      board: board
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};
