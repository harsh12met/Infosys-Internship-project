// In-memory column storage
let columns = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'inprogress', title: 'In Progress', order: 1 },
  { id: 'done', title: 'Done', order: 2 }
];

// Get all columns
exports.getAllColumns = (req, res) => {
  res.json(columns);
};

// Create new column
exports.createColumn = (req, res) => {
  const { id, title } = req.body;
  
  if (!id || !title) {
    return res.status(400).json({ error: 'ID and title are required' });
  }

  const newColumn = {
    id,
    title,
    order: columns.length
  };

  columns.push(newColumn);
  res.status(201).json(newColumn);
};

// Update column
exports.updateColumn = (req, res) => {
  const columnId = req.params.id;
  const columnIndex = columns.findIndex(c => c.id === columnId);
  
  if (columnIndex === -1) {
    return res.status(404).json({ error: 'Column not found' });
  }

  columns[columnIndex] = {
    ...columns[columnIndex],
    ...req.body,
    id: columnId // Ensure ID doesn't change
  };

  res.json(columns[columnIndex]);
};

// Delete column
exports.deleteColumn = (req, res) => {
  const columnId = req.params.id;
  const columnIndex = columns.findIndex(c => c.id === columnId);
  
  if (columnIndex === -1) {
    return res.status(404).json({ error: 'Column not found' });
  }

  // Prevent deleting default columns
  if (['todo', 'inprogress', 'done'].includes(columnId)) {
    return res.status(400).json({ error: 'Cannot delete default columns' });
  }

  columns.splice(columnIndex, 1);
  res.json({ message: 'Column deleted successfully' });
};
