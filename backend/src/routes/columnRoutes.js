const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');

// Column routes
router.get('/', columnController.getAllColumns);
router.post('/', columnController.createColumn);
router.put('/:id', columnController.updateColumn);
router.delete('/:id', columnController.deleteColumn);

module.exports = router;
