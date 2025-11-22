const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const commentController = require('../controllers/commentController');

// Task routes
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Comment routes
router.get('/:taskId/comments', commentController.getTaskComments);
router.post('/:taskId/comments', commentController.addTaskComment);

module.exports = router;
