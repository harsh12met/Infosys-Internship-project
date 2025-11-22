// In-memory data storage (replace with database later)
let tasks = [
  {
    id: 1,
    title: 'Sample Task',
    description: 'This is a sample task',
    priority: 'Medium',
    status: 'todo',
    createdAt: new Date().toISOString(),
    order: 0
  }
];

let nextId = 2;

// Get all tasks
exports.getAllTasks = (req, res) => {
  res.json(tasks);
};

// Get task by ID
exports.getTaskById = (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
};

// Create new task
exports.createTask = (req, res) => {
  const { title, description, priority, status } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: nextId++,
    title,
    description: description || '',
    priority: priority || 'Medium',
    status: status || 'todo',
    createdAt: new Date().toISOString(),
    order: tasks.filter(t => t.status === (status || 'todo')).length
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

// Update task
exports.updateTask = (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...req.body,
    id: taskId // Ensure ID doesn't change
  };

  res.json(tasks[taskIndex]);
};

// Delete task
exports.deleteTask = (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.json({ message: 'Task deleted successfully' });
};
