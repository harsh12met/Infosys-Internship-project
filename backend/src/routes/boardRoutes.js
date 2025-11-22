const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const commentController = require('../controllers/commentController');

// Get board for a user or group
// GET /api/boards?ownerId={userId or groupId}&ownerType={user or group}
router.get('/', boardController.getBoard);

// Update entire board (columns and tasks)
// PUT /api/boards
router.put('/', boardController.updateBoard);

// Add a column to the board
// POST /api/boards/columns
router.post('/columns', boardController.addColumn);

// Delete a column
// DELETE /api/boards/columns
router.delete('/columns', boardController.deleteColumn);

// Add a task to a column
// POST /api/boards/tasks
router.post('/tasks', boardController.addTask);

// Update a task
// PUT /api/boards/tasks
router.put('/tasks', boardController.updateTask);

// Delete a task
// DELETE /api/boards/tasks
router.delete('/tasks', boardController.deleteTask);

// Clear all board data (comments and notifications)
// POST /api/boards/clear
router.post('/clear', boardController.clearBoard);

// Clean up orphaned comments (admin/maintenance endpoint)
// POST /api/boards/cleanup-comments
router.post('/cleanup-comments', commentController.cleanupOrphanedComments);

module.exports = router;
