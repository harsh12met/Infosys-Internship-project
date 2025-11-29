const Comment = require('../models/commentModel');
const Board = require('../models/boardModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// Get comments for a task
exports.getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { boardOwnerId, boardOwnerType } = req.query;

    if (!boardOwnerId || !boardOwnerType) {
      return res.status(400).json({
        success: false,
        message: 'Board owner information required'
      });
    }

    const comments = await Comment.find({ 
      taskId,
      boardOwnerId,
      boardOwnerType
    }).sort({ createdAt: 1 });

    console.log(`💬 Fetched ${comments.length} comments for task ${taskId} on ${boardOwnerType} board ${boardOwnerId}`);

    res.status(200).json({
      success: true,
      comments
    });

  } catch (error) {
    console.error('Get Task Comments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
};

// Add comment to task
exports.addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, authorId, authorName, authorEmail, assignedTo, boardOwnerId, boardOwnerType, taskTitle } = req.body;

    if (!text || !authorId || !authorName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: text, authorId, authorName'
      });
    }

    if (!boardOwnerId || !boardOwnerType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: boardOwnerId, boardOwnerType'
      });
    }

    // Find the task to get its title and column name
    let taskName = 'a task';
    let columnName = '';
    if (boardOwnerId && boardOwnerType) {
      const board = await Board.findOne({
        ownerId: boardOwnerId,
        ownerType: boardOwnerType
      });

      if (board) {
        // Find the task in any column
        for (const column of board.columns) {
          const task = column.tasks.find(t => t.id === taskId);
          if (task) {
            taskName = task.title;
            columnName = column.title;
            break;
          }
        }
      }
    }

    const comment = new Comment({
      taskId,
      boardOwnerId,
      boardOwnerType,
      text,
      authorId,
      authorName,
      authorEmail
    });

    await comment.save();

    console.log(`💬 Comment added to task "${taskName}" (${taskId}) by ${authorName}`);

    // Find the comment author to determine who to notify
    const user = await User.findById(authorId);
    if (user && user.groupId) {
      
      // If the author is a MEMBER, notify the LEADER
      if (user.role === 'member') {
        const leader = await User.findOne({
          groupId: user.groupId,
          role: 'leader'
        });

        if (leader) {
          await createNotification({
            userId: leader._id.toString(),
            type: 'comment_added',
            title: 'New Comment',
            message: `${authorName} commented on "${taskName}" in ${columnName}`,
            taskId: taskId,
            fromUserId: authorId,
            fromUserName: authorName
          });
          console.log('📬 Notification sent to leader:', leader.name);
        }
      }
      
      // If the author is a LEADER, notify the ASSIGNED MEMBER
      if (user.role === 'leader' && assignedTo) {
        const assignedMember = await User.findById(assignedTo);
        
        if (assignedMember && assignedMember.role === 'member') {
          await createNotification({
            userId: assignedMember._id.toString(),
            type: 'comment_added',
            title: 'New Comment',
            message: `${authorName} commented on "${taskName}" in ${columnName}`,
            taskId: taskId,
            fromUserId: authorId,
            fromUserName: authorName
          });
          console.log('📬 Notification sent to member:', assignedMember.name);
        }
      }
    }

    res.status(201).json({
      success: true,
      comment,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Add Task Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// Clean up orphaned comments (comments without board ownership)
exports.cleanupOrphanedComments = async (req, res) => {
  try {
    console.log('🧹 Starting cleanup of orphaned comments...');
    
    // Delete all comments that don't have boardOwnerId or boardOwnerType
    const result = await Comment.deleteMany({
      $or: [
        { boardOwnerId: { $exists: false } },
        { boardOwnerId: null },
        { boardOwnerType: { $exists: false } },
        { boardOwnerType: null }
      ]
    });
    
    console.log(`✅ Cleaned up ${result.deletedCount} orphaned comments`);
    
    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} orphaned comments`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Cleanup Orphaned Comments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cleaning up orphaned comments'
    });
  }
};
